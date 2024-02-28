import { Router, Config, Pg} from "@fermyon/spin-sdk"
import { v4 as uuidv4 } from 'uuid';
const encoder = new TextEncoder()
const decoder = new TextDecoder()

let router = Router()
const DEFAULT_HEADERS = { 
    "Access-Control-Allow-Origin": "http://localhost:8080",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Content-Type": "application/json"};

const withConfig = (request) => {
    request.config = {
        db: Config.get("db_connection_string")
    };
}

const preflight = () => {
    return {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "http://localhost:8080",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "*"
        }
    }
};
router.get("/items",withConfig, ({config}) => getAllItems(config));
router.post("/items",withConfig, ({config}, content) => createNewItem(config, content));
router.delete("/items/:id", withConfig, ({params, config}) => deleteItemById(config, params.id));
router.all('*', preflight)

function createNewItem(config, content) {
    try{
        let payload = JSON.parse(decoder.decode(content));
        if (!payload || !payload.value) {
            throw "invalid payload";
        }
        const id = uuidv4();
        Pg.execute(config.db, "INSERT INTO ITEMS (ID, VALUE) VALUES ($1, $2)", [id, payload.value])

        return {
            status: 201,
            headers: DEFAULT_HEADERS,
            body: encoder.encode(JSON.stringify({
                id: id,
                value: payload.value
            }))
        };
    }
    catch(err){
        return {
            status: 400
        };
    }
}
function getAllItems(config) {
    let queryResult = Pg.query(config.db, "SELECT ID, VALUE FROM ITEMS", [])
    let items = queryResult.rows.map(row => {
        return {
            id: row[0],
            value: row[1]
        }
    });
    return {
        status: 200,
        headers: DEFAULT_HEADERS,
        body: encoder.encode(JSON.stringify(items))
    }
}

function deleteItemById(config, id) {
    if (!id) {
        return {
            status: 400
        };
    }
    Pg.execute(config.db, "DELETE FROM ITEMS WHERE ID= $1", [id])
    return {
        status: 204,
        headers: DEFAULT_HEADERS
    }
}

export const handleRequest  = async function(request) {
    return await router.handleRequest(request, request.body)
}