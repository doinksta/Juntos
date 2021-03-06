const fs = require('fs');
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const mime = require('mime');
const cors = require('cors')

const faker = require('faker');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/treehacks2019',
    {useNewUrlParser: true});

const Photo = mongoose.model('photo', {
  person_id: {
    type: mongoose.Schema.Types.ObjectId,
    unique: true
  },
  data: Buffer,
  content_type: String,
  content_length: Number,
  python_id: {
    type: Number,
    unique: true
  }
});

const Person = mongoose.model('person', {
  name: String,
  email: String,
  phone_number: String,
  address: String,
  latitude: Number,
  longitude: Number,
  is_missing: Boolean,
  is_looking: Boolean,
  missing_name: String
});

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

async function add_person(imgFile, i) {
  let is_missing = (getRandomInt(1000) % 2 == 0);
  let is_looking = (getRandomInt(1000) % 2 == 0);
  personBody = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    address: faker.address.streetAddress(),
    latitude: Math.random() * 6 + 27,
    longitude: Math.random() * -5 - 99,
    phone_number: faker.phone.phoneNumber(),
    is_missing: is_missing,
    is_looking: is_looking,
  }

  if (is_looking) {
    personBody['missing_name'] = faker.name.findName();
  }
  //console.log('described person')
  const person = new Person(personBody);
  await person.save()
    .then(async doc => {

      let image = fs.readFileSync(imgFile);

      const photo = new Photo({
        data: image,
        content_type: 'image/jpeg',
        content_length: image.length,
        python_id: i,
        person_id: doc._id,
      });

      //console.log('described photo')
      await photo.save();
    });
}

async function iterate_thumbnails () {
  let imgString = fs.readFileSync('img_list.txt').toString();
  
  let imgList = imgString.split('\n');
  console.log('start iterating')
  for (let i = 0; i < imgList.length; i += 1) {
    await add_person(imgList[i], i);
    if (i % 100 == 0) {
      console.log(i);
    }
  }
}
iterate_thumbnails();
