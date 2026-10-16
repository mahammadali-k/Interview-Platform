// Logs the error and answers with a generic 500, so controllers don't repeat the same catch boilerplate
export function serverError(res, name, error) {
  console.log(`Error in ${name} controller:`, error.message);
  res.status(500).json({ message: "Internal Server Error" });
}
