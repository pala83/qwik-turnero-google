import {
  component$,
  Slot,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { PokemonGameContext, PokemonListContext } from "~/context";
import type { PokemonGameState, PokemonListState } from "~/context";

const POKEMON_STATE = "pokemon-game-state";

export const PokemonProvider = component$(() => {
  const pokemonGame = useStore<PokemonGameState>({
    pokemonId: 1,
    showBack: false,
  });

  const pokemonList = useStore<PokemonListState>({
    currentPage: 1,
    isLoading: false,
    pokemons: [],
  });

  useContextProvider(PokemonGameContext, pokemonGame);
  useContextProvider(PokemonListContext, pokemonList);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (localStorage.getItem(POKEMON_STATE)) {
      const data = JSON.parse(localStorage.getItem(POKEMON_STATE)!);
      pokemonGame.pokemonId = data.pokemonId;
      pokemonGame.showBack = data.showBack;
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => (pokemonGame.pokemonId, pokemonGame.showBack));
    localStorage.setItem(POKEMON_STATE, JSON.stringify(pokemonGame));
  });

  return <Slot />;
});
