import { component$, useComputed$ } from "@builder.io/qwik";
import {
  Link,
  routeLoader$,
  useLocation,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { PokemonImage } from "~/components/shared/pokemons/pokemonImage";
import { getSmallPokemons } from "~/helpers/get-pokemons";
import { SmallPokemon } from "~/models";

export const usePokemonList = routeLoader$<SmallPokemon[]>(
  async ({ query, redirect, pathname }) => {
    const offset = Number(query.get("offset") || "0");
    if (isNaN(offset) || offset < 0) redirect(301, pathname);
    return await getSmallPokemons(offset, 50);
  },
);

export default component$(() => {
  const pokemons = usePokemonList();
  const location = useLocation();
  const currentOffset = useComputed$<number>(() => {
    const offsetString = new URLSearchParams(location.url.search);
    return Number(offsetString.get("offset") || 0);
  });

  // const changeOffset = $((value: number) => {
  // if((currentOffset.value + value*10) <= 0)
  //     return;
  // currentOffset.value += value*10;
  // });

  return (
    <>
      <div class="flex flex-col">
        <span class="my-5 text-5xl">Status</span>
        <span>Offset: {currentOffset.value / 10}</span>
        <span>Está cargando página: {location.isNavigating ? "Sí" : "No"}</span>
      </div>
      <div class="mt-10">
        <Link
          href={`/pokemons/list-ssr/?offset=${currentOffset.value === 0 ? 0 : currentOffset.value - 10}`}
          class="btn btn-primary mr-2"
        >
          Anteriores
        </Link>
        <Link
          href={`/pokemons/list-ssr/?offset=${currentOffset.value + 10}`}
          class="btn btn-primary mr-2"
        >
          Siguientes
        </Link>
      </div>

      <div class="mt-5 grid grid-cols-6">
        {pokemons.value.map(({ name, id }) => (
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
  title: "SSR - Listado de Pokemons",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
