const compress = require('koa-compress')
const Koa = require('koa')

const app = new Koa()
	app.use(compress({
		  filter (content_type) {
			    	return /text/i.test(content_type)
					  },
		    threshold: 2048,
		      gzip: {
			          flush: require('zlib').Z_SYNC_FLUSH
					    },
		        deflate: {
				    flush: require('zlib').Z_SYNC_FLUSH,
				      },
			  br: false // disable brotli
	}))
