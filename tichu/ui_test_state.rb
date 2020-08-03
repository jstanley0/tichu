# for testing UI states without having to slog through four connections, etc.

class UiTestState
  def players
    []
  end

  def connect!(websocket, player_id)
    send_fake_state(websocket, player_id)
  end

  def message(_msg, websocket, player_id)
    send_fake_state(websocket, player_id)
  end

  def any_connections?
    true
  end

  def disconnect!(_websocket)
  end

  def send_fake_state(websocket, player_id)
    h = {
      "id" => "UITEST",
      "scores" => [540, -80],
      "players" => [
        {
          "name" => "The Player",
          "hand_size" => 5,
          "tichu" => 100,
          "tichu_status" => nil,
          "points_taken" => 0,
          "passed_cards" => true
        },
        {
          "name" => "Bot 1",
          "hand_size" => 14,
          "tichu" => 200,
          "tichu_status" => nil,
          "points_taken" => 100,
          "passed_cards" => true
        },
        {
          "name" => "Bot 2",
          "hand_size" => 8,
          "tichu" => 100,
          "tichu_status" => false,
          "points_taken" => -10,
          "passed_cards" => true
        },
        {
          "name" => "Bot 3",
          "hand_size" => 4,
          "tichu" => 100,
          "tichu_status" => true,
          "points_taken" => 10,
          "passed_cards" => true
        }
      ],
      "end_score" => 1000,
      "state" => "passing",
      "wish_rank" => "4",
      "turn" => 0,
      "trick_winner" => 1,
      "dragon_trick" => nil,
      "log" => [
        {
          "text" => "this is a message"
        },
        {
          "text" => "here are some cards", "cards" => "012345fg"
        },
        {
          "error" => "this is an error"
        }
      ],
      "last_play" => nil
    }
    if player_id.present?
      h['players'][0].merge!({"hand" => "01bcdefg", "can_tichu" => true, "can_gt" => true, "possible_plays" => {"" => 1, "0" => 1, "1" => 1, "bcde" => 8}, "bomb" => "bcde"})
    end

    websocket.send(h.to_json)
  end
end