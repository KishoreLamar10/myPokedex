
const POKEAPI = "https://pokeapi.co/api/v2";

async function checkOffset() {
    console.log("Checking offset 1025...");
    const res = await fetch(`${POKEAPI}/pokemon?limit=10&offset=1025`);
    const data = await res.json();
    console.log("First 10 items after 1025:");
    data.results.forEach((p: any) => console.log(p.name, p.url));
}

checkOffset();
