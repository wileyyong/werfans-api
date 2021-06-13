export = {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  resolver: (file: string) => require(file),
  baseFolder: './app',
  configs: [
    '../config.local.json', '../config.local.?s',
    `../config/env/${(<any>global).FORCED_NODE_ENV || process.env.NODE_ENV}.?s`,
    '../config/env/all.?s',
    '**/config/*/.?s',
  ],
  phases: [
    {
      sources: [],
      makers: [
        '../makers/log.maker.?s',
      ],
    },
    {
      sources: [],
      makers: [
        '../app/lib/services/moleculer.service/moleculerBroker.maker.?s',
      ],
    },
    {
      sources: [
        { name: 'consts', path: ['lib/consts.?s', '**/consts/*.?s'], merge: true },
        { name: 'schemas', path: '**/schemas/*.?s', merge: true },
        { name: 'models', path: '**/models/*.model.?s' },
      ],
      makers: [
        '../makers/mongoose.maker.?s',
      ],
    },
    {
      sources: [
        { name: 'molecules', path: '**/molecules/**/*.molecule.?s' },
        { name: 'emails', path: '**/emails/**/*.email.?s' },
      ],
      makers: [
        '**/services/**/*.service.?s',
      ],
    },
    {
      sources: [
        { name: 'apiControllers', path: '**/controllers/others/*.controller.?s' },
        { name: 'restControllers', path: '**/controllers/rest/*.controller.?s' },
        { name: 'middlewares', path: '**/middlewares/*.middleware.?s' },
      ],
      makers: [
        '../makers/express.maker.?s',
      ],
    },
  ],
};
