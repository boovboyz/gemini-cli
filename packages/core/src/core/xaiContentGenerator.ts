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
} from '@google/genai';
import { FinishReason, GenerateContentResponse } from '@google/genai';
import type { ContentGenerator } from './contentGenerator.js';
import { toContents } from '../code_assist/converter.js';

const XAI_API_BASE_URL = 'https://api.x.ai/v1';

interface XAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface XAIChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
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

/**
 * ContentGenerator implementation for xAI (Grok) API
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
   * Convert Gemini format content to xAI/OpenAI format messages
   */
  private convertToXAIMessages(contents: Content[]): XAIMessage[] {
    const messages: XAIMessage[] = [];

    for (const content of contents) {
      const role =
        content.role === 'user'
          ? 'user'
          : content.role === 'model'
            ? 'assistant'
            : 'system';

      // Combine all text parts into a single message
      const textParts = content.parts
        ?.filter((part: Part) => 'text' in part)
        .map((part: Part) => (part as { text: string }).text)
        .join('\n');

      if (textParts) {
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
    response.candidates = [
      {
        content: {
          role: 'model',
          parts: [
            {
              text: choice.message.content,
            },
          ],
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

    const requestBody = {
      model: request.model || 'grok-2-1212',
      messages,
      temperature: request.config?.temperature ?? 0.7,
      max_tokens: request.config?.maxOutputTokens ?? 4096,
      stream: false,
    };

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

    const requestBody = {
      model: request.model || 'grok-2-1212',
      messages,
      temperature: request.config?.temperature ?? 0.7,
      max_tokens: request.config?.maxOutputTokens ?? 4096,
      stream: true,
    };

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
              const chunk = JSON.parse(jsonStr);
              if (chunk.choices?.[0]?.delta?.content) {
                const geminiResponse = new GenerateContentResponse();
                geminiResponse.candidates = [
                  {
                    content: {
                      role: 'model',
                      parts: [
                        {
                          text: chunk.choices[0].delta.content,
                        },
                      ],
                    },
                    finishReason: chunk.choices[0].finish_reason
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
    const totalText = messages.map((m) => m.content).join(' ');

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
