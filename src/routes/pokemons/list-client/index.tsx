import { $, component$, useOnDocument, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { PokemonImage } from "~/components/shared/pokemons/pokemonImage";
import { getSmallPokemons } from "~/helpers/get-pokemons";
import type { SmallPokemon } from "~/models";

interface PokemonPageState {
  currentPage: number;
  pokemons: SmallPokemon[];
  isLoading?: boolean;
}

export default component$(() => {
  const pokemonState = useStore<PokemonPageState>({
    currentPage: 0,
    pokemons: [],
    isLoading: false,
  });

  useTask$(async ({ track }) => {
    track(() => pokemonState.currentPage);
    const pokemons = await getSmallPokemons(pokemonState.currentPage * 30, 30);
    pokemonState.pokemons = [...pokemonState.pokemons, ...pokemons];
    pokemonState.isLoading = false;
  });

  useOnDocument("scroll", $(() => {
    const maxScroll = document.body.scrollHeight;
    const currentScroll = window.scrollY + window.innerHeight;
    if (currentScroll + 200 >= maxScroll && !pokemonState.isLoading) {
      pokemonState.isLoading = true;
      pokemonState.currentPage++;
    }
  }));

  const changePokemonId = $((value: number) => {
    if (pokemonState.currentPage + value < 0) return;
    pokemonState.currentPage += value;
  });

  return (
    <>
      <div class="flex flex-col">
        <span class="my-5 text-5xl">Status</span>
        <span>Página actual: {pokemonState.currentPage}</span>
        <span>Está cargando página: </span>
      </div>
      <div class="mt-10">
        <button
          onClick$={() => changePokemonId(1)}
          class="btn btn-primary mr-2"
        >
          Siguientes
        </button>
      </div>

      <div class="mt-5 grid sm:grid-cols-2 md:grid-cols-5 xl:grid-cols-7">
        {pokemonState.pokemons.map(({ name, id }) => (
          <div key={name} class="m-5 flex flex-col items-center justify-center">
            <PokemonImage pokemonId={id} size={100} />
            <span class="capitalize">{name}</span>
          </div>
        ))}
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Client - Listado de Pokemons",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
