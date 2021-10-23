require 'pg'
require 'uri'
require 'zlib'

require_relative 'state'

class Database
  # database is optional and is used only to preserve in-progress games over a dyno restart
  def self.configured?
    ENV['DATABASE_URL'].present?
  end

  def self.connect
    db = new
    yield db
  ensure
    db.close
  end

  def initialize
    raise "database not configured" unless self.class.configured?
    @conn = PG.connect(self.class.connection_params)
  end

  def close
    @conn&.close
  end

  def load_game(game_id)
    @conn.exec_params('SELECT data FROM games WHERE id=$1', [game_id], 1) do |result|
      if result.ntuples == 1
        data = Zlib::inflate(result[0]['data'])
        Marshal.restore(data)
      end
    end
  end

  def delete_game(game_id)
    @conn.exec_params('DELETE FROM games WHERE id=$1', [game_id])
  end

  def save_game(game)
    @conn.exec_params('INSERT INTO games (id, data) VALUES ($1, $2) ON CONFLICT(id) DO UPDATE SET data=$2',
                      [game.id, compressed_blob(game.dump)])
  end

  def self.connection_params
    return nil unless configured?

    @params ||= begin
      database_url = ENV['DATABASE_URL']
      uri = URI.parse(database_url)
      {
          host: uri.host,
          port: uri.port,
          dbname: uri.path[1..],
          user: uri.user,
          password: uri.password
      }
    end
  end

  private def compressed_blob(data)
    { :value => Zlib::deflate(data), :type => 0, :format => 1 }
  end
end
