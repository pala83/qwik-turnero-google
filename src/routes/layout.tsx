import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

import Header from "../components/shared/header/header";
import { PokemonProvider } from "~/context/pokemon/pokemon-provider";

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export default component$(() => {
  return (
    <PokemonProvider>
      <Header />
      <main class="flex flex-col items-center justify-center">
        <Slot />
      </main>
    </PokemonProvider>
  );
});
