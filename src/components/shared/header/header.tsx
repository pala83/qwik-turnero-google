import { component$ } from "@builder.io/qwik";
import { QwikLogo } from "../../icons/qwik";
import { Link } from "@builder.io/qwik-city";
import { Button } from "~/components/ui";

import { ToggleTheme } from "../toggleTheme/toggleTheme";

export default component$(() => {
  return (
    <header class="">
      <div class="flex justify-between align-middle">
        <div class="inline-block">
          <Link href="/" title="qwik">
            <QwikLogo height={50} width={143} />
          </Link>
        </div>
        <ul class="flex list-none gap-3">
          <li>
            <Button>
              <Link href="/counter">CounterHook</Link>
            </Button>
          </li>

          <li>
            <Button>
              <Link href="/pokemons/list-ssr/">SSR</Link>
            </Button>
          </li>

          <li>
            <Button>
              <Link href="/pokemons/list-client/">Client</Link>
            </Button>
          </li>
          <li>
            <ToggleTheme />
          </li>
        </ul>
      </div>
    </header>
  );
});
