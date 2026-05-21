export const MESSAGE_SWAP = "swap" as const;
export const MESSAGE_SWAP_RESULT = "swapResult" as const;

export interface SwapMessage {
  fromIndex: number;
  toIndex: number;
}

export interface SwapResultMessage {
  success: boolean;
  reason?: string;
}
