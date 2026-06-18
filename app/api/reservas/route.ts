import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ReservaSchema } from "@/lib/validations"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = ReservaSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("reservas")
      .insert(parsed.data)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send confirmation email to customer
    await resend.emails.send({
      from: "Casa Goyo <reservas@casagoyo.com>",
      to: parsed.data.email,
      subject: "Reserva recibida — Restaurante Casa Goyo",
      html: `
        <h2>¡Hola ${parsed.data.nombre}!</h2>
        <p>Hemos recibido tu solicitud de reserva para el <strong>${parsed.data.fecha}</strong> a las <strong>${parsed.data.hora}</strong> para <strong>${parsed.data.personas} personas</strong>.</p>
        <p>En breve te contactaremos para confirmar. Si tienes alguna duda, llámanos.</p>
        <p>Gracias — <em>Restaurante Casa Goyo, Alcocer (Guadalajara)</em></p>
      `,
    })

    // Notify owner
    await resend.emails.send({
      from: "Casa Goyo App <noreply@casagoyo.com>",
      to: process.env.ADMIN_EMAIL!,
      subject: `Nueva reserva: ${parsed.data.nombre} — ${parsed.data.fecha}`,
      html: `
        <h2>Nueva solicitud de reserva</h2>
        <ul>
          <li><strong>Nombre:</strong> ${parsed.data.nombre}</li>
          <li><strong>Email:</strong> ${parsed.data.email}</li>
          <li><strong>Teléfono:</strong> ${parsed.data.telefono ?? "—"}</li>
          <li><strong>Fecha:</strong> ${parsed.data.fecha}</li>
          <li><strong>Hora:</strong> ${parsed.data.hora}</li>
          <li><strong>Personas:</strong> ${parsed.data.personas}</li>
          <li><strong>Notas:</strong> ${parsed.data.notas ?? "—"}</li>
        </ul>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/reservas">Gestionar en el panel de admin</a></p>
      `,
    })

    return NextResponse.json({ ok: true, id: data.id })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
