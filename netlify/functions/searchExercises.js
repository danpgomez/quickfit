export async function handler(event) {
  const query = event.queryStringParameters.query;
  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Query is required" }),
    };
  }

  const url = `https://exercisedb.p.rapidapi.com/exercises/name/${query}`;
  
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
    });

    const data = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("Error fetching from ExerciseDB:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API fetch failed" }),
    };
  }
}
