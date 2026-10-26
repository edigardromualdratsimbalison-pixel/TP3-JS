// Partie 3 - Chargement des données externes.
export const fetchData = async (url = "data/data.json") => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Chargement impossible (${response.status} ${response.statusText}) : ${url}`);
  }

  return await response.json();
};
