const [, , token, id] = process.argv;
(async () => {
  const res = await fetch(`https://api.escm.kurly.com/api/v2/purchaseorders/${id}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
})();
