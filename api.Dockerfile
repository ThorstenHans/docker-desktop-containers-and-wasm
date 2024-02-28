FROM scratch
COPY src/api/spin.toml /spin.toml
COPY src/api/target/*.wasm /target/
ENTRYPOINT ["/spin.toml"]