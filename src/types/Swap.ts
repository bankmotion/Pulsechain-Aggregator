export interface TokenType {
  address: string;
  name: string;
  symbol: string;
  blockchainNetwork: string;
  network: string;
  decimals: number;
  image: string;
  rank: number;
  type: string;
  usdPrice: number;
  token_security: any;
  network_rank: number;
  price: number;
  // Additional fields for currency support
  hasExternalId?: boolean;
  isExtraIdSupported?: boolean;
  isFiat?: boolean;
  featured?: boolean;
  isStable?: boolean;
  supportsFixedRate?: boolean;
  buy?: boolean;
  sell?: boolean;
  legacyTicker?: string;
}

export interface QuoteType {
  calldata: string;
  tokenInAdress: string;
  tokenOutAddress: string;
  outputAmount: number;
  gasUSDEstimated: number;
  route: RouteType[];
}

export interface RouteType {
  percent: number;
  subroutes: SubrouteType[];
}

export interface SubrouteType {
  percent: number;
  paths: PathType[];
}

export interface PathType {
  exchange: string;
  percent: number;
  tokens: RouteTokenType[];
}

export interface RouteTokenType {
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
}

export interface CurrencyType {
  ticker: string;
  name: string;
  image: string;
  hasExternalId: boolean;
  isExtraIdSupported: boolean;
  isFiat: boolean;
  featured: boolean;
  isStable: boolean;
  supportsFixedRate: boolean;
  network: string;
  tokenContract: string;
  buy: boolean;
  sell: boolean;
  legacyTicker: string;
}

export interface ExchangeRateType {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  fees: {
    depositFee: number;
    withdrawalFee: number;
  };
  minAmount: number;
  maxAmount: number | null;
  validUntil: number | null;
}

export interface TransactionType {
  transactionId: string;
  payinAddress: string;
  expectedAmount: number;
  status: string;
  validUntil: number | null;
}

export interface OrderType {
  id: string;
  status: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number | null;
  payinAddress: string;
  payinHash: string | null;
  payoutHash: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
