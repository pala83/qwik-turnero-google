import { component$ } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  Form,
  useLocation,
} from "@builder.io/qwik-city";
import { getCalendarEvents, createCalendarEvent } from "~/helpers/calendar";

// Loader to get events
export const useCalendarEvents = routeLoader$(async (requestEvent) => {
  const calendarId = requestEvent.params.id;
  const session = requestEvent.sharedMap.get("session") as any;
  const accessToken = session?.accessToken;
  const apiKey = requestEvent.env.get("GOOGLE_API_KEY") || "";

  // Range: Now to 1 month from now
  const now = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(now.getMonth() + 1);

  try {
    const data = await getCalendarEvents(
      calendarId,
      accessToken,
      apiKey,
      now.toISOString(),
      oneMonthLater.toISOString(),
    );
    return { events: data.items || [], calendarId };
  } catch (e) {
    console.error(e);
    return {
      events: [],
      error:
        "No se pudieron cargar los eventos. Asegúrate de que el calendario sea público o esté compartido contigo.",
    };
  }
});

// Action to book
export const useBookTurno = routeAction$(async (data, requestEvent) => {
  const session = requestEvent.sharedMap.get("session") as any;
  if (!session || !session.accessToken) {
    return { success: false, message: "Debes iniciar sesión para reservar." };
  }

  const providerEmail = requestEvent.params.id;
  const { start, end, summary } = data;

  try {
    await createCalendarEvent(session.accessToken, {
      summary: summary as string,
      start: { dateTime: start as string },
      end: { dateTime: end as string },
      attendees: [{ email: providerEmail }],
    });
    return {
      success: true,
      message:
        "Solicitud de turno enviada con éxito (se ha creado el evento en tu calendario e invitado al profesional).",
    };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Error al reservar turno." };
  }
});

export default component$(() => {
  const eventsSignal = useCalendarEvents();
  const bookAction = useBookTurno();
  const loc = useLocation();

  return (
    <div class="mx-auto max-w-4xl p-4">
      <h1 class="mb-6 text-2xl font-bold">
        Reservar Turno con <span class="text-blue-600">{loc.params.id}</span>
      </h1>

      {eventsSignal.value.error && (
        <div class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {eventsSignal.value.error}
        </div>
      )}

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 class="mb-4 text-xl font-semibold">
            Agenda del Profesional (Ocupado)
          </h2>
          <div class="overflow-hidden rounded-lg bg-white shadow">
            <ul class="max-h-[500px] divide-y divide-gray-200 overflow-y-auto">
              {eventsSignal.value.events.map((event: any) => (
                <li key={event.id} class="p-4 hover:bg-gray-50">
                  <div class="font-medium text-gray-900">
                    {event.summary || "Ocupado"}
                  </div>
                  <div class="text-sm text-gray-500">
                    {new Date(
                      event.start.dateTime || event.start.date,
                    ).toLocaleString()}{" "}
                    -
                    {new Date(
                      event.end.dateTime || event.end.date,
                    ).toLocaleString()}
                  </div>
                </li>
              ))}
              {eventsSignal.value.events.length === 0 && (
                <li class="p-4 text-gray-500">
                  No hay eventos próximos visibles.
                </li>
              )}
            </ul>
          </div>
        </div>

        <div>
          <h2 class="mb-4 text-xl font-semibold">Solicitar Turno</h2>
          <Form
            action={bookAction}
            class="space-y-4 rounded-lg bg-white p-6 shadow"
          >
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Motivo de la consulta
              </label>
              <input
                name="summary"
                type="text"
                required
                class="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ej: Consulta general"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Inicio
              </label>
              <input
                name="start"
                type="datetime-local"
                required
                class="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Fin
              </label>
              <input
                name="end"
                type="datetime-local"
                required
                class="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              class="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Enviar Solicitud
            </button>
          </Form>
          {bookAction.value?.message && (
            <div
              class={`mt-4 rounded p-3 ${bookAction.value.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {bookAction.value.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
