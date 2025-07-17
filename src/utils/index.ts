import { SupportTypes, ZeroAddress } from "../const/swap";
import { TokenType } from "../types/Swap";

const isPulseChainToken = (token: TokenType): boolean =>
  token.blockchainNetwork === "pulsechain";

const isEthereumToken = (token: TokenType): boolean =>
  token.blockchainNetwork === "ethereum";

const isNativeToken = (token: TokenType): boolean =>
  token.address === ZeroAddress;

const isPulseChainToPulseChain = (
  fromToken: TokenType,
  toToken: TokenType
): boolean => isPulseChainToken(fromToken) && isPulseChainToken(toToken);

const isTokenSupported = (token: TokenType, type: "buy" | "sell"): boolean => {
  if (isPulseChainToken(token)) {
    return isNativeToken(token);
  }
  if (isEthereumToken(token)) {
    return !!token[type];
  }
  return true;
};

export const isBridgeOrPulse = (
  fromToken: TokenType,
  toToken: TokenType
): SupportTypes => {
  if (isPulseChainToPulseChain(fromToken, toToken)) {
    return SupportTypes.PulseChain;
  }

  if (
    (!isTokenSupported(fromToken, "sell") && isEthereumToken(fromToken)) ||
    (!isTokenSupported(toToken, "buy") && isEthereumToken(toToken)) ||
    (isPulseChainToken(fromToken) && !isNativeToken(fromToken)) ||
    (isPulseChainToken(toToken) && !isNativeToken(toToken))
  ) {
    return SupportTypes.NotSupported;
  }

  return SupportTypes.Bridge;
};
