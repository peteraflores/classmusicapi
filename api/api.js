const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;
var express = require('express');
var app = express();
const { Client } = require('pg')
function connect(){
  const client = new Client({
    user: 'p320_32',
    host: 'reddwarf.cs.rit.edu',
    database: 'p320_32',
    password: 'shaiw1Zeeze6nie1idae',
    port: 5432,
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
  client.query(`SELECT s."songName",
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
  client.query(`SELECT a."albumName",a."releaseDate",a."trackAmount",g."genreName",art."artistName" from (( albums a
    full outer join genres g on a."genreId" = g."genreId")
    full outer join artists art on a."artistId" = art."artistId") order by "albumName"`,(err,{rows}={}) =>{
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
  client.query(`SELECT * from `,(err,{rows}={}) =>{
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


var server = app.listen(port, hostname, function () {
  console.log(`Node server is running on ${hostname}:${port}`);
});
