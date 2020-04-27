let nodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./testobj.json")));

console.log(JSON.stringify(nodes));
