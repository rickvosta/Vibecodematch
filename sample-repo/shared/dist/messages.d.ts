export declare const MESSAGE_SWAP: "swap";
export declare const MESSAGE_SWAP_RESULT: "swapResult";
export interface SwapMessage {
    fromIndex: number;
    toIndex: number;
}
export interface SwapResultMessage {
    success: boolean;
    reason?: string;
}
