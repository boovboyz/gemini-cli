/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  CountTokensResponse,
  GenerateContentParameters,
  CountTokensParameters,
  EmbedContentResponse,
  EmbedContentParameters,
  Part,
  Content,
  FunctionCall,
  Tool,
} from '@google/genai';
import { FinishReason, GenerateContentResponse } from '@google/genai';
import type { ContentGenerator } from './contentGenerator.js';
import { toContents } from '../code_assist/converter.js';

const XAI_API_BASE_URL = 'https://api.x.ai/v1';

interface XAITool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
}

interface XAIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface XAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: XAIToolCall[];
  tool_call_id?: string;
  name?: string;
}

interface XAIChoice {
  index: number;
  message: {
    role: string;
    content: string | null;
    tool_calls?: XAIToolCall[];
  };
  finish_reason: string;
}

interface XAIStreamChoice {
  index: number;
  delta: {
    role?: string;
    content?: string;
    tool_calls?: XAIToolCall[];
  };
  finish_reason?: string;
}

interface XAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: XAIChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface XAIStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: XAIStreamChoice[];
}

/**
 * ContentGenerator implementation for xAI (Grok) API with tool calling support
 */
export class XAIContentGenerator implements ContentGenerator {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(
    apiKey: string,
    baseUrl: string = XAI_API_BASE_URL,
    headers: Record<string, string> = {},
  ) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...headers,
    };
  }

  /**
   * Convert Gemini format tools to xAI/OpenAI format
   * Handles ToolListUnion which can be Tool | CallableTool
   */
  private convertToXAITools(tools?: unknown): XAITool[] | undefined {
    if (!tools) {
      return undefined;
    }

    // Convert tools to array if it's not already
    const toolsArray = Array.isArray(tools) ? tools : [tools];

    const xaiTools: XAITool[] = [];

    for (const tool of toolsArray) {
      // Only process Tool type (has functionDeclarations)
      if (
        typeof tool === 'object' &&
        tool !== null &&
        'functionDeclarations' in tool
      ) {
        const typedTool = tool as Tool;
        if (typedTool.functionDeclarations) {
          for (const func of typedTool.functionDeclarations) {
            xaiTools.push({
              type: 'function',
              function: {
                name: func.name || '',
                description: func.description,
                parameters: func.parameters as
                  | Record<string, unknown>
                  | undefined,
              },
            });
          }
        }
      }
    }

    return xaiTools.length > 0 ? xaiTools : undefined;
  }

  /**
   * Convert Gemini format content to xAI/OpenAI format messages
   */
  private convertToXAIMessages(contents: Content[]): XAIMessage[] {
    const messages: XAIMessage[] = [];

    for (const content of contents) {
      // Handle function calls from model
      const functionCalls = content.parts?.filter(
        (part: Part) => 'functionCall' in part && part.functionCall,
      );

      // Handle function responses from user
      const functionResponses = content.parts?.filter(
        (part: Part) => 'functionResponse' in part && part.functionResponse,
      );

      // Handle text content
      const textParts = content.parts
        ?.filter((part: Part) => 'text' in part && part.text)
        .map((part: Part) => (part as { text: string }).text)
        .join('\n');

      // If this is a model response with function calls
      if (
        content.role === 'model' &&
        functionCalls &&
        functionCalls.length > 0
      ) {
        const toolCalls: XAIToolCall[] = functionCalls.map((part: Part) => {
          const fc = (part as { functionCall: FunctionCall }).functionCall;
          return {
            id:
              fc.id ||
              `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'function',
            function: {
              name: fc.name || '',
              arguments: JSON.stringify(fc.args || {}),
            },
          };
        });

        messages.push({
          role: 'assistant',
          content: textParts || null,
          tool_calls: toolCalls,
        });
      }
      // If this is a user message with function responses
      else if (
        content.role === 'user' &&
        functionResponses &&
        functionResponses.length > 0
      ) {
        for (const part of functionResponses) {
          const fr = (
            part as {
              functionResponse: {
                id?: string;
                name?: string;
                response?: Record<string, unknown>;
              };
            }
          ).functionResponse;
          messages.push({
            role: 'tool',
            tool_call_id: fr.id || '',
            name: fr.name,
            content: JSON.stringify(fr.response || {}),
          });
        }
      }
      // Regular text message
      else if (textParts) {
        const role =
          content.role === 'user'
            ? 'user'
            : content.role === 'model'
              ? 'assistant'
              : 'system';

        messages.push({
          role,
          content: textParts,
        });
      }
    }

    return messages;
  }

  /**
   * Convert xAI response to Gemini format
   */
  private convertToGeminiResponse(
    xaiResponse: XAIResponse,
  ): GenerateContentResponse {
    const choice = xaiResponse.choices[0];
    if (!choice) {
      throw new Error('No choices in xAI response');
    }

    const response = new GenerateContentResponse();
    const parts: Part[] = [];

    // Add text content if present
    if (choice.message.content) {
      parts.push({
        text: choice.message.content,
      });
    }

    // Add function calls if present
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      for (const toolCall of choice.message.tool_calls) {
        parts.push({
          functionCall: {
            id: toolCall.id,
            name: toolCall.function.name,
            args: JSON.parse(toolCall.function.arguments || '{}'),
          },
        });
      }
    }

    response.candidates = [
      {
        content: {
          role: 'model',
          parts,
        },
        finishReason: this.mapFinishReason(choice.finish_reason),
        safetyRatings: [],
      },
    ];

    response.usageMetadata = xaiResponse.usage
      ? {
          promptTokenCount: xaiResponse.usage.prompt_tokens,
          candidatesTokenCount: xaiResponse.usage.completion_tokens,
          totalTokenCount: xaiResponse.usage.total_tokens,
        }
      : undefined;

    return response;
  }

  private mapFinishReason(xaiReason: string): FinishReason | undefined {
    switch (xaiReason) {
      case 'stop':
        return FinishReason.STOP;
      case 'tool_calls':
        return FinishReason.STOP;
      case 'length':
        return FinishReason.MAX_TOKENS;
      case 'content_filter':
        return FinishReason.SAFETY;
      default:
        return FinishReason.FINISH_REASON_UNSPECIFIED;
    }
  }

  async generateContent(
    request: GenerateContentParameters,
    _userPromptId: string,
  ): Promise<GenerateContentResponse> {
    // Convert contents to proper Content array
    const contentsArray = toContents(request.contents);

    const messages = this.convertToXAIMessages(contentsArray);

    // Add system instruction if present
    if (request.config?.systemInstruction) {
      const systemText =
        typeof request.config.systemInstruction === 'string'
          ? request.config.systemInstruction
          : (request.config.systemInstruction as Content).parts
              ?.filter((part: Part) => 'text' in part)
              .map((part: Part) => (part as { text: string }).text)
              .join('\n');

      if (systemText) {
        messages.unshift({
          role: 'system',
          content: systemText,
        });
      }
    }

    const requestBody: Record<string, unknown> = {
      model: request.model || 'grok-4-fast-reasoning',
      messages,
      temperature: request.config?.temperature ?? 0,
      max_tokens: request.config?.maxOutputTokens ?? 8192,
      stream: false,
    };

    // Add tools if present
    const tools = this.convertToXAITools(request.config?.['tools']);
    if (tools) {
      requestBody['tools'] = tools;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`xAI API error (${response.status}): ${errorText}`);
    }

    const xaiResponse = (await response.json()) as XAIResponse;
    return this.convertToGeminiResponse(xaiResponse);
  }

  async generateContentStream(
    request: GenerateContentParameters,
    _userPromptId: string,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    // Convert contents to proper Content array
    const contentsArray = toContents(request.contents);

    const messages = this.convertToXAIMessages(contentsArray);

    // Add system instruction if present
    if (request.config?.systemInstruction) {
      const systemText =
        typeof request.config.systemInstruction === 'string'
          ? request.config.systemInstruction
          : (request.config.systemInstruction as Content).parts
              ?.filter((part: Part) => 'text' in part)
              .map((part: Part) => (part as { text: string }).text)
              .join('\n');

      if (systemText) {
        messages.unshift({
          role: 'system',
          content: systemText,
        });
      }
    }

    const requestBody: Record<string, unknown> = {
      model: request.model || 'grok-4-fast-reasoning',
      messages,
      temperature: request.config?.temperature ?? 0,
      max_tokens: request.config?.maxOutputTokens ?? 8192,
      stream: true,
    };

    // Add tools if present
    const tools = this.convertToXAITools(request.config?.['tools']);
    if (tools) {
      requestBody['tools'] = tools;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`xAI API error (${response.status}): ${errorText}`);
    }

    if (!response.body) {
      throw new Error('No response body from xAI API');
    }

    const generator = this.streamResponseBody(response.body);
    return generator;
  }

  private async *streamResponseBody(
    body: ReadableStream<Uint8Array>,
  ): AsyncGenerator<GenerateContentResponse> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const accumulatedToolCalls: Map<number, XAIToolCall> = new Map();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            try {
              const chunk = JSON.parse(jsonStr) as XAIStreamResponse;
              const delta = chunk.choices?.[0]?.delta;

              if (!delta) continue;

              const geminiResponse = new GenerateContentResponse();
              const parts: Part[] = [];

              // Handle text content
              if (delta.content) {
                parts.push({
                  text: delta.content,
                });
              }

              // Handle tool calls (streaming)
              if (delta.tool_calls) {
                for (const toolCall of delta.tool_calls) {
                  // Accumulate tool call data
                  const existing = accumulatedToolCalls.get(
                    toolCall.id ? 0 : 0,
                  );
                  if (existing) {
                    existing.function.arguments +=
                      toolCall.function.arguments || '';
                  } else {
                    accumulatedToolCalls.set(0, toolCall);
                  }
                }
              }

              // If we have a finish reason, emit accumulated tool calls
              if (chunk.choices?.[0]?.finish_reason) {
                for (const toolCall of accumulatedToolCalls.values()) {
                  parts.push({
                    functionCall: {
                      id: toolCall.id,
                      name: toolCall.function.name,
                      args: JSON.parse(toolCall.function.arguments || '{}'),
                    },
                  });
                }
                accumulatedToolCalls.clear();
              }

              if (parts.length > 0) {
                geminiResponse.candidates = [
                  {
                    content: {
                      role: 'model',
                      parts,
                    },
                    finishReason: chunk.choices?.[0]?.finish_reason
                      ? this.mapFinishReason(chunk.choices[0].finish_reason)
                      : undefined,
                    safetyRatings: [],
                  },
                ];
                yield geminiResponse;
              }
            } catch (e) {
              console.error('Error parsing SSE chunk:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async countTokens(
    request: CountTokensParameters,
  ): Promise<CountTokensResponse> {
    // Convert contents to proper Content array
    const contentsArray = toContents(request.contents);

    // xAI doesn't provide a token counting endpoint
    // Provide a rough estimate based on text length
    const messages = this.convertToXAIMessages(contentsArray);
    const totalText = messages.map((m) => m.content || '').join(' ');

    // Rough estimation: ~4 characters per token
    const estimatedTokens = Math.ceil(totalText.length / 4);

    return {
      totalTokens: estimatedTokens,
    };
  }

  async embedContent(
    _request: EmbedContentParameters,
  ): Promise<EmbedContentResponse> {
    throw new Error('xAI does not support embedding generation');
  }
}
