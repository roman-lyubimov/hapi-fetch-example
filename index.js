'use strict';

const path = require('path');

const Hapi = require('hapi');
const Boom = require('boom');
const {URL} = require('url');
const Joi = require('joi');
const fs = require('fs');
const fsx = require('fs-extra');
const xmlParser = require('fast-xml-parser');
const _request = require('request');

const app = new Hapi.server({
  port: 3000
});

// Resources
let seq = 1;
const resources = { };

app.route({
  method: 'POST',
  path: '/download',
  handler: function (request, h) {
    const url = new URL(request.query.uri);
    const file = path.basename(url.pathname);
    const fileName = path.join(__dirname, 'var', file);

    const newId = seq++;
    resources[newId] = {id: newId, status: 'downloading', fileName};

    console.log(`Start download of "${url}"`);

    // Pipe file directly to the file system
    _request(url.toString()).pipe(fs.createWriteStream(fileName)).on('finish', () => {
      console.log('Download complete');

      // Update resource status
      resources[newId].status = 'processing';

      // Schedule processing to the next tick
      process.nextTick(async () => {
        const xmlData = await fsx.readFile(fileName);
        const tObject = xmlParser.getTraversalObj(xmlData.toString('utf8'));

        resources[newId].data = xmlParser.convertToJson(tObject);

        console.log('Processing complete');

        // Update resource status
        resources[newId].status = 'ready';
      });
    });

    return h.response().created(`/resources/${newId}`);
  },
  options: {
    validate: {
      query: Joi.object().keys({
        uri: Joi.string().uri().required()
      }).required()
    }
  }
});

app.route({
  method: 'GET',
  path: '/resources/{id}',
  handler: function (request, h) {
    const id = request.params.id;
    const resource = resources[id];

    if (!Boolean(resource)) {
      throw Boom.notFound('There is no resource with such id');
    }

    return resource;
  },
  options: {
    validate: {
      params: Joi.object().keys({
        id: Joi.string().required()
      })
    }
  }
});

(async () => {
  await app.start();
  console.log(`Server running at ${app.info.uri}`);
})();