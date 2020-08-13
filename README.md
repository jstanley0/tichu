# tichu
a pandemic-friendly tichu game playable over the web

## Setup

Requirements: bundler and yarn

 * install backend dependencies with `bundle install`
 * install frontend dependencies with `yarn`
 * compile assets with `yarn build`
 * start with `rackup`

## Server notes

 * There is no matchmaking capability; you simply share a game code out of band. Tichu works best in conjunction with some kind of a web conference anyway.
 * There is no authentication. 
 * There is no persistent storage. If you restart the server, you lose any games in progress.
 
## Game notes

 * If the phoenix can make multiple substitutions for the same set of cards, it will be substituted for the higher card. For example, if you play 5, 5, 9, 9, P, the phoenix will be interpreted as a 9 in the full house.

## Copyright

Copyright (C) 2020 Jeremy Stanley

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

