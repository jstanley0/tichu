# tichu
a pandemic-friendly tichu game playable over the web

## Setup

Requirements: bundler and yarn

 * install backend dependencies with `bundle install`
 * install frontend dependencies with `yarn`
 * compile assets with `yarn build`
 * start with `rackup`

## Server notes

 * There is no matchmaking capability; you simply share a game link out of band. Tichu works best in conjunction with some kind of a web conference anyway.
 * There is no authentication. 
 * There is no means to scale beyond one app server. Doing that with a websocket-based game would require some rearchitecting of the backend. I may take that on someday for the challenge, but there hasn't been a need for it yet.
 * Game state is stored in-memory. You can optionally configure a Postgres database (via ENV.DATABASE_URL) that will be used solely to persist games across a server restart. I added this capability after Heroku rebooted my dyno when I was about to complete a Grand Tichu 😭. Run db/create_database.sql to initialize the data store.
 
## Game notes

 * If the phoenix can make multiple substitutions for the same set of cards, it will be substituted for the higher card. For example, if you play 5, 5, 9, 9, P, the phoenix will be interpreted as a 9 in the full house.

## Copyright

Copyright (C) 2020-2021 Jeremy Stanley

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

