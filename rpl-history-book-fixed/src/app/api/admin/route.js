export async function POST(request) {
  const { password } = await request.json();
  const adminPass = process.env.RPLHRPASS;

  if (!adminPass) {
    return Response.json({ error: 'Admin password not configured' }, { status: 500 });
  }

  if (password === adminPass) {
    return Response.json({ success: true });
  }

  return Response.json({ error: 'Invalid password' }, { status: 401 });
}
