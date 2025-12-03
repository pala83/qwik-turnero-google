import { component$ } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  z,
  Form,
  zod$,
} from "@builder.io/qwik-city";
import { google } from "googleapis";
import { getOauthClient } from "~/helpers/google-auth";

// 1. Loader para LEER eventos (Server-Side)
export const useCalendarEvents = routeLoader$(async ({ cookie, redirect }) => {
  const refreshToken = cookie.get("g_refresh_token")?.value;

  if (!refreshToken) {
    throw redirect(302, "/login");
  }

  const auth = getOauthClient();
  auth.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: "v3", auth });

  // Calculamos rango: Hoy hasta 1 mes
  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: now.toISOString(),
    timeMax: nextMonth.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  return response.data.items || [];
});

// 2. Action para CREAR un turno (Server-Side)
export const useCreateBooking = routeAction$(
  async (data, { cookie }) => {
    const refreshToken = cookie.get("g_refresh_token")?.value;
    if (!refreshToken) return { success: false, error: "No autorizado" };

    const auth = getOauthClient();
    auth.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar({ version: "v3", auth });

    // Crear evento
    await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: `Turno: ${data.clientName}`,
        description: `Servicio para ${data.clientEmail}`,
        start: { dateTime: data.startTime }, // Formato ISO
        end: { dateTime: data.endTime }, // Formato ISO
      },
    });

    return { success: true };
  },
  zod$({
    clientName: z.string(),
    clientEmail: z.string().email(),
    startTime: z.string(),
    endTime: z.string(),
  }),
);

export default component$(() => {
  const events = useCalendarEvents();
  const bookingAction = useCreateBooking();

  return (
    <div class="p-5">
      <h1>Panel de Control</h1>

      <h2>Próximos Turnos Ocupados (Google Calendar)</h2>
      <ul>
        {events.value.map((event: any) => (
          <li key={event.id}>
            {event.summary} - {new Date(event.start.dateTime).toLocaleString()}
          </li>
        ))}
      </ul>

      <hr />

      <h2>Agendar Nuevo Turno</h2>
      <Form action={bookingAction}>
        <input name="clientName" placeholder="Nombre del cliente" />
        <input name="clientEmail" placeholder="Email del cliente" />
        <input name="startTime" type="datetime-local" />
        <input name="endTime" type="datetime-local" />
        <button type="submit">Reservar</button>
      </Form>
    </div>
  );
});
