const hostname = '192.168.1.38';
const port = 3000;
const { response } = require('express');
var express = require('express');
var app = express();
app.use(express.json())
const { Client } = require('pg')
function connect(){
  const client = new Client({
    user: 'p320_32',
    host: 'reddwarf.cs.rit.edu',
    database: 'p320_32',
    password: 'shaiw1Zeeze6nie1idae',
    port: 5432,
    connectionTimeoutMillis: 60000, // number of milliseconds to wait for connection, default is no timeout
  })
  client.connect()
  return client
}
/*
`SELECT *
  FROM pg_catalog.pg_tables
  WHERE schemaname != 'pg_catalog' AND
      schemaname != 'information_schema'`
*/



app.get('/', function (req, res) {
  res.send(JSON.stringify({ message: "Hello World"}));
});
app.get('/songs', async function (req, res) {
  const client = connect()
  client.query(`SELECT 
  s."songId",
  s."songName",
  s."featuringOtherArtist",
  s."songLength",
  art."artistName",
  a."albumName",
  g."genreName",
  s."songPlayCount",
  a."releaseDate"
      from  ((((all_mapped_details amd
inner join albums a on a."albumId" = amd."albumId")
inner join songs s on s."songId" = amd."songId")
inner join genres g on g."genreId" = s."genreId")
inner join artists art on s."artistId" = art."artistId")`,(err,{rows}={}) =>{
    if(!err){
      console.log(rows)
      res.send(rows)
    }
    else{
      console.log(err)
      res.send(err)
    }
    client.end()
  })
});
app.get('/artists', async function (req, res) {
  const client = connect()
  client.query("SELECT * from artists",(err,{rows}={}) =>{
    if(!err){
      console.log(rows)
      res.send(rows)
    }
    else{
      console.log(err)
      res.send(err)
    }
    client.end()
  })
});
app.get('/albums', async function (req, res) {
  const client = connect()
  client.query(`SELECT a."albumName", a."albumId", a."releaseDate",a."trackAmount",g."genreName",art."artistName" from (( albums a
    left outer join genres g on a."genreId" = g."genreId")
    left outer join artists art on a."artistId" = art."artistId") order by "albumName"`,(err,{rows}={}) =>{
    if(!err){
      console.log(rows)
      res.send(rows)
    }
    else{
      console.log(err)
      res.send(err)
    }
    client.end()
  })
});

app.get('/genres', async function (req, res) {
  const client = connect()
  client.query(`SELECT * from genres`,(err,{rows}={}) =>{
    if(!err){
      console.log(rows)
      res.send(rows)
    }
    else{
      console.log(err)
      res.send(err)
    }
    client.end()
  })
});

app.get('/favorites/:user', async function (req, res) {
  const client = connect()
  const {user} = req.params
  client.query(`SELECT s."songId",s."songName",g."genreName","artistName" FROM (((user_favorited_songs ufs
    inner join songs s on ufs."songId" = s."songId" and ufs."userId_f"=${user})
    inner join genres g on g."genreId" = s."genreId" )
    inner join artists art on art."artistId"=s."artistId")`,(err,{rows}={}) =>{
    if(!err){
      console.log(rows)
      res.send(rows)
    }
    else{
      console.log(err)
      res.send(err)
    }
    client.end()
  })
});

app.get('/history/:user', async function (req, res) {
  const client = connect()
  const {user} = req.params
  client.query(`SELECT s."songId",s."songName",g."genreName","artistName" FROM (((user_favorited_songs ufs
    inner join songs s on ufs."songId" = s."songId" and ufs."userId_f"=${user})
    inner join genres g on g."genreId" = s."genreId" )
    inner join artists art on art."artistId"=s."artistId")`,(err,{rows}={}) =>{
    if(!err){
      console.log(rows)
      res.send(rows)
    }
    else{
      console.log(err)
      res.send(err)
    }
    client.end()
  })
});

app.get('/admin/addsong/:songName/:genre/:songLength/:artist/:otherArtist', async function (req, res) {
  
  
  var song = req.params["songName"]
  var genre = req.params["genre"]
  var length = req.params["songLength"]
  var artist = req.params["artist"]
  var featured = req.params["otherArtist"]

  song=="NULL"?song=null:1+1
  genre=="NULL"?genre=null:1+1
  length=="NULL"?length=null:1+1
  artist=="NULL"?artist=null:1+1
  genre=="NULL"?genre=null:1+1
  featured=="NULL"?featured=null:1+1

  const client = connect()
  
  const ArtistId = await new Promise(async success=>{
      await client.query(`INSERT INTO artists ("artistName") VALUES ('${artist}') ON CONFLICT DO NOTHING`)
      client.query(`SELECT "artistId" FROM artists WHERE "artistName"='${artist}'`,(err,{rows}={}) =>{
        if(!err){
          success(rows[0].artistId)
        }
        else{
          console.log(err)
          res.send(err)
        }
      })
  })
  console.log(ArtistId)
  
  const FeaturedId = await new Promise(async success=>{
    if (featured){
      console.log("Quering for featured")
      await client.query(`INSERT INTO artists ("artistName") VALUES ('${featured}') ON CONFLICT DO NOTHING`)
      await client.query(`SELECT "artistId" FROM artists WHERE "artistName"='${featured}'`,(err,{rows}={}) =>{
        if(!err){
          success(rows[0].artistId)
        }
        else{
          console.log(err)
          res.send(err)
          return;
        }
      })
    }
    else{
      success(null)
    }
  })
  console.log(FeaturedId)

  const GenreId = await new Promise(async success=>{
    console.log("Quering for genre")
    await client.query(`INSERT INTO genres ("genreName","albumsWithGenre","songsWithGenre") VALUES ('${genre}',0,0) ON CONFLICT DO NOTHING;`)
    await client.query(`SELECT "genreId" FROM genres WHERE "genreName"='${genre}'`,(err,{rows}={}) =>{
      if(!err){
        success(rows[0].genreId)
      }
      else{
        success(null)
        console.log(err)
        res.send(err)
      }
    })
  })
  console.log(GenreId)
  
  await new Promise(async success=>{
    console.log(`Inserting '${song}',${GenreId},${length},0,${FeaturedId},${ArtistId}`)
    client.query(`INSERT INTO songs ("songName", "genreId", "songLength", "songPlayCount", "featuringOtherArtist", "artistId") VALUES ('${song}',${GenreId},${length},0,${FeaturedId},${ArtistId})`,(err,{rows}={}) =>{
      if (!err){
        res.send({"Sucessfully Created Song":song})
        success()
      }else{
        console.log(err)
        res.send(err)
      }
    })
  })
    
})


var server = app.listen(port, hostname, function () {
  console.log(`Node server is running on ${hostname}:${port}`);
});
