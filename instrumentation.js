import connect from './lib/mongo'

export async function register() {
    await connect()
}