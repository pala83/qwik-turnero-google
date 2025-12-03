import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { getAuthUrl } from "~/helpers/google-auth";

export const userLoginLoader = routeLoader$(({ redirect }) => {
  const url = getAuthUrl();
  throw redirect(302, url);
});

export const Index = component$(() => {
  return <div>Redirigiendo a Google...</div>;
});
