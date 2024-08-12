import entrypoint from "./entrypoint";

const run = async () => {
    const [username, subdomain] = process.argv.slice(2);
    await entrypoint(username, subdomain);
}

run();