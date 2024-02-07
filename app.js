const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running')
    })
  } catch (e) {
    console.log(`DB Error :${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertMovieDbObjToResObj = dbObj => {
  return {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
  }
}

const convertDirectorDbObjToresObj = dbObj => {
  return {
    directorId: dbObj.director_id,
    directorName: dbObj.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const movieNameQuery = `SELECT movie_name FROM movie;`
  const movies = await db.all(movieNameQuery)
  response.send(movies.map(eachMovie => convertMovieDbObjToResObj(eachMovie)))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const updateMovie = `
    INSERT INTO 
    movie (director_id , movie_name,lead_actor)
    VALUES (${directorId},"${movieName}","${leadActor}");
    `
  await db.run(updateMovie)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT * FROM
    movie
    WHERE movie_id = ${movieId};
    `
  const movie = await db.get(getMovieQuery)
  response.send(convertMovieDbObjToResObj(movie))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieQuery = `
    UPDATE movie
    SET 
    director_id = ${directorId},
    movie_name = "${movieName}",
    lead_actor = "${leadActor}"
    WHERE movie_id = ${movieId};
    `
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};
    `
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director`
  const directors = await db.all(getDirectorsQuery)
  response.send(directors.map(each => convertMovieDbObjToResObj(each)))
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const directorMovieQuery = `
    SELECT 
    movie_name
    FROM 
    movie
    WHERE director_id = ${directorId};
    `
  const movies = db.all(directorMovieQuery)
  response.send(movies.map(eachmovie => ({movieName: eachmovie.movie_name})))
})
