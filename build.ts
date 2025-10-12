
async function build() {
  const result = await Bun.build({
    entrypoints: ['./src/index.html','./src/index.ts'],
    outdir: './dist/',
    minify: true
  });

  if (result.success) {
    console.log("build success")
    return
  }

  console.log("failed to build")
  console.log()
  for (const log of result.logs) {
    console.table(log)
  }
}

await build()
