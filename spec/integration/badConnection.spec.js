require('../setup')
const rabbit = require('../../src/index.js')

describe('Bad Connection', function () {
  const noop = () => {}
  describe('when attempting a connection', function () {
    let error
    before(() => {
      rabbit.once('#.connection.failed', (err) => {
        error = err
      })

      return rabbit.addConnection({
        name: 'silly',
        server: 'shfifty-five.gov',
        publishTimeout: 50,
        timeout: 100,
        failAfter: .3,
        retryLimit: 2
      }).then(() => {
        return rabbit.addExchange({ name: 'silly-ex' }, 'silly')
      })
    })

    it('should fail to connect', () =>
      error.should.equal('No endpoints could be reached')
    )

    it('should reject publish after timeout', () =>
      rabbit.publish('silly-ex', { body: 'test' }, 'silly')
        .catch(e => {
          return e
        })
        .should.be.rejectedWith('No endpoints could be reached')
    )

    after(() => rabbit.close('silly', true))
  })

  describe('when configuring against a bad connection', function () {
    let config
    before(() => {
      config = {
        connection: {
          name: 'silly2',
          server: 'this-is-not-a-real-thing-at-all.org',
          timeout: 100,
          failAfter: .05,
          retryLimit: 2
        },
        exchanges: [
          {
            name: 'rabbot-ex.direct',
            type: 'direct',
            autoDelete: true
          }
        ],
        queues: [
          {
            name: 'rabbot-q.direct',
            autoDelete: true,
            subscribe: true
          }
        ],
        bindings: [
          {
            exchange: 'rabbot-ex.direct',
            target: 'rabbot-q.direct',
            keys: ''
          }
        ]
      }
    })

    it('should fail to connect', function () {
      return rabbit.configure(config)
        .should.be.rejectedWith('No endpoints could be reached')
    })

    after(function () {
      return rabbit.close('silly2', true)
    })
  })
})
