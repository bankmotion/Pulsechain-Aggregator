export enum TokenGlobTag {
  All = "All",
  Popular = "Popular",
  Promo = "Promo",
  "Layer-2" = "Layer-2",
  EVM = "EVM",
  NonEVM = "Non-EVM",
}

export const ZeroAddress = "0x0000000000000000000000000000000000000000";

export const SwapManagerAddress = "0x9215D43D73E4d44D5E47A94f4CB2D05DD2CA14Fc";

export enum ChainSymbol {
  ETH = "ETH",
  PLS = "PLS",
}

export const Chains = [
  {
    name: "Ethereum",
    symbol: ChainSymbol.ETH,
    chainId: 1,
    img: "http://api-assets.rubic.exchange/assets/rubic/eth/0x0000000000000000000000000000000000000000/logo_9LYU9u5.png",
    network: "ethereum",
  },
  {
    name: "PulseChain",
    symbol: ChainSymbol.PLS,
    chainId: 369,
    img: "http://api-assets.rubic.exchange/assets/coingecko/pulsechain/0x0000000000000000000000000000000000000000/logo.png",
    network: "pulsechain",
  },
];

export enum SupportTypes {
  NotSupported = "NotSupported",
  PulseChain = "PulseChain",
  Bridge = "Bridge",
}
