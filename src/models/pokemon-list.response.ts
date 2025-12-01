export interface PokemonListResponse {
  count: number;
  next: string;
  previous: null;
  results: BasicPokeInfo[];
}

export interface BasicPokeInfo {
  name: string;
  url: string;
}
