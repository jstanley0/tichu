require_relative 'tichu/tichu.rb'

use Rack::Protection, except: :host_authorization

run Sinatra::Application
