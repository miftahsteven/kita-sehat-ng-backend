async function test() {
  try {
    const res = await fetch("http://localhost:4003/api/admin/banners");
    const data = await res.json();
    console.log("Banners:", data);
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}
test();
