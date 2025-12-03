import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { getOauthClient } from "~/helpers/google-auth";

export const useAuthCallback = routeLoader$(
  async ({ query, cookie, redirect }) => {
    const code = query.get("code");
    if (!code) {
      throw redirect(302, "/error");
    }
    try {
      const oauth2Client = getOauthClient();
      const { tokens } = await oauth2Client.getToken(code);
      // TODO: produccion ciudaon con esto
      // Guardamos el Refresh Token en una cookie segura (HttpOnly)
      // ADVERTENCIA: En producción, considera encriptar este valor antes de guardarlo.
      cookie.set("g_refresh_token", tokens.refresh_token!, {
        httpOnly: true,
        secure: true, // Esto es pa cuando lo tenga en produccion https
        path: "/",
        maxAge: [30, "days"], // aprox 1 mes
        sameSite: "lax", // Protege contra CSRF
      });

      cookie.set("g_access_token", tokens.access_token!, {
        httpOnly: true, // Necesario para que el cliente pueda acceder al token
        secure: true,
        path: "/",
        maxAge: [1, "hours"], // aprox 1 hora
        sameSite: "lax", // Protege contra CSRF
      });

      throw redirect(302, "/");
    } catch (error) {
      console.error("Error en autenticación:", error);
      throw redirect(302, "/error");
    }
  },
);

export default component$(() => {
  return <div>Procesando autenticación...</div>;
});
