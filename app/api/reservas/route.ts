import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ReservaSchema } from "@/lib/validations"
import { Resend } from "resend"

// Escape HTML entities to prevent XSS attacks
function escapeHtml(text: string | undefined | null): string {
  if (!text) return ""
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export async function POST(req: Request) {
  try {
    // Rate limiting: log IP address for excessive request detection
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    console.log(`[RESERVATION] Request from IP: ${ip}`)

    const body = await req.json()
    const parsed = ReservaSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const resend   = new Resend(process.env.RESEND_API_KEY)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("reservas")
      .insert(parsed.data)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send confirmation email to customer (with HTML escaping for XSS prevention)
    const customerEmailResult = await resend.emails.send({
      from: "Casa Goyo <reservas@casagoyo.com>",
      to: parsed.data.email,
      subject: "Reserva recibida — Restaurante Casa Goyo",
      html: `
        <h2>¡Hola ${escapeHtml(parsed.data.nombre)}!</h2>
        <p>Hemos recibido tu solicitud de reserva para el <strong>${escapeHtml(parsed.data.fecha)}</strong> a las <strong>${escapeHtml(parsed.data.hora)}</strong> para <strong>${escapeHtml(String(parsed.data.personas))} personas</strong>.</p>
        <p>En breve te contactaremos para confirmar. Si tienes alguna duda, llámanos.</p>
        <p>Gracias — <em>Restaurante Casa Goyo, Alcocer (Guadalajara)</em></p>
      `,
    })

    if (customerEmailResult.error) {
      console.error(`[RESERVATION] Customer email failed:`, customerEmailResult.error)
      return NextResponse.json(
        { error: "Failed to send confirmation email" },
        { status: 500 }
      )
    }

    // Notify owner (with HTML escaping for XSS prevention)
    const adminEmailResult = await resend.emails.send({
      from: "Casa Goyo App <noreply@casagoyo.com>",
      to: process.env.ADMIN_EMAIL!,
      subject: `Nueva reserva: ${escapeHtml(parsed.data.nombre)} — ${escapeHtml(parsed.data.fecha)}`,
      html: `
        <h2>Nueva solicitud de reserva</h2>
        <ul>
          <li><strong>Nombre:</strong> ${escapeHtml(parsed.data.nombre)}</li>
          <li><strong>Email:</strong> ${escapeHtml(parsed.data.email)}</li>
          <li><strong>Teléfono:</strong> ${escapeHtml(parsed.data.telefono) || "—"}</li>
          <li><strong>Fecha:</strong> ${escapeHtml(parsed.data.fecha)}</li>
          <li><strong>Hora:</strong> ${escapeHtml(parsed.data.hora)}</li>
          <li><strong>Personas:</strong> ${escapeHtml(String(parsed.data.personas))}</li>
          <li><strong>Notas:</strong> ${escapeHtml(parsed.data.notas) || "—"}</li>
        </ul>
        <p><a href="${escapeHtml(process.env.NEXT_PUBLIC_SITE_URL)}/admin/reservas">Gestionar en el panel de admin</a></p>
      `,
    })

    if (adminEmailResult.error) {
      console.error(`[RESERVATION] Admin notification failed:`, adminEmailResult.error)
      return NextResponse.json(
        { error: "Failed to send admin notification" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, id: data.id })
  } catch (error) {
    console.error(`[RESERVATION] Unexpected error:`, error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
