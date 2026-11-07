export function profile(request, response) {
  response.status(200).json({ success: true, user: request.user });
}
