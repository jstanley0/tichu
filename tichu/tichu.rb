at_exit { save_games! } # this has to come before requiring sinatra

require 'multitrap'
require 'sinatra'
require 'sinatra-websocket'
require 'active_support'
require 'active_support/core_ext'

require_relative 'state'
require_relative 'player'
require_relative 'ui_test_state'
require_relative 'database'

$games = {}
$stopping = false

# ensure websocket connections are shut down when Heroku reboots our dyno
trap('TERM') do
  $stopping = true
  EM.stop
end

# ensure games remain available to save on Ctrl+C
trap('INT') do
  $stopping = true
end

get '/' do
  erb :index
end

post '/new' do
  halt 400, 'missing required parameter `name`' unless params['name'].present?

  game = State.new(end_score: (params['end_score'] || 1000).to_i)
  $games[game.id] = game

  player = Player.new(params['name'])
  game.add_player!(player)

  { game_id: game.id, player_id: player.id }.to_json
end

get '/ping' do
  'pong'
end

get '/games' do
  password = params['password']&.strip
  halt 401 unless ENV['PASSWORD'].present? && password == ENV['PASSWORD']
  $games.keys.to_json
end

get '/connect' do
  halt 400, 'this is a websocket endpoint' unless request.websocket?
  game_id = params['game_id'].upcase.strip
  STDERR.puts "Connect request to #{game_id}"
  halt 400, 'missing required parameter `game_id`' unless game_id.present?
  player_id = params['player_id'].upcase.strip.presence

  game = $games[game_id]
  if !game
    if game_id == 'TEST'
      game = $games[game_id] = State.new(id: 'TEST')
    elsif game_id == 'UITEST'
      game = $games[game_id] = UiTestState.new
    elsif Database.configured?
      # reload the game if the server was restarted
      Database.connect do |db|
        game = db.load_game(game_id)
        if game
          $stderr.puts "loaded game #{game_id} from database"
          $games[game_id] = game
          db.delete_game(game_id) # it's just a snapshot; we'll save it again if we need to restart again
        end
      end
    end
  end
  halt 400, 'invalid game_id' unless game

  if player_id && !game.is_a?(UiTestState)
    player = game.players.find { |player| player.id == player_id }
    if !player && player_id == 'TEST'
      if game.players.size < 4
        player = Player.new("Player #{game.players.size}")
        game.add_player!(player)
      else
        player = game.players.first
      end
      player_id = player.id
    end
    halt 400, 'invalid player_id' unless player
  end

  request.websocket do |ws|
    ws.onopen do
      game.connect!(ws, player_id)
    end
    ws.onmessage do |msg|
      game.message(msg, ws, player_id)
    end
    ws.onclose do
      game.disconnect!(ws)
      unless game.any_connections? || $stopping
        # use a timer to prevent the game from disappearing while the last player reloads the page
        EM.add_timer(5) do
          unless game.any_connections?
            STDERR.puts "Deleting game #{game_id}"
            $games.delete(game_id)
          end
        end
      end
    end
  end
end

not_found do
  '404 Not Found :('
end

def save_games!
  if $games.empty?
    $stderr.puts "no active games to save"
    return
  end

  unless Database.configured?
    $stderr.puts "database not configured; unable to save games"
    return
  end

  $stderr.puts "saving #{$games.size} games to database"
  Database.connect do |db|
    $games.each do |id, game|
      db.save_game(game)
    end
  end
end
