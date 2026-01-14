export const registerDisplay = async () => {
  const res = await fetch("http://localhost:5000/api/display/register", {
    method: "POST"
  });

  return res.json();
};
