const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ANIMALS = [
  { name: 'Grey Lady', slug: 'grey-lady', id: 288211 },
  { name: 'Al', slug: 'al', id: 288212 },
  { name: 'J.D.', slug: 'jd', id: 288213 },
  { name: 'Saltarina', slug: 'saltarina', id: 288214 },
  { name: 'Bezerra', slug: 'bezerra', id: 288215 },
  { name: 'Dorien', slug: 'dorien', id: 288216 },
  { name: 'Chancellor Shark', slug: 'chancellor-shark', id: 288217 },
  { name: 'Maya Marina', slug: 'maya-marina', id: 288218 },
  { name: 'Beamer', slug: 'beamer', id: 288219 },
  { name: 'Emma', slug: 'emma', id: 288220 },
  { name: 'Princess Fi', slug: 'princess-fi', id: 288221 },
  { name: 'Sophie Grace', slug: 'sophie-grace', id: 288222 },
  { name: 'Pablo', slug: 'pablo', id: 288223 },
  { name: 'DeMott', slug: 'demott', id: 288224 },
  { name: 'Albertina', slug: 'albertina', id: 288225 },
  { name: 'Luis Antonio', slug: 'luis-antonio', id: 288227 },
  { name: 'Septima', slug: 'septima', id: 288228 },
  { name: 'Lyla Grace', slug: 'lyla-grace', id: 288229 },
  { name: 'ACK', slug: 'ack', id: 288230 },
  { name: 'Madaket Millie', slug: 'madaket-millie', id: 288231 },
  { name: 'TJ', slug: 'tj', id: 288232 },
  { name: 'Triton', slug: 'triton', id: 288233 },
  { name: 'Merlin', slug: 'merlin', id: 288234 },
  { name: 'Machaca', slug: 'machaca', id: 288235 },
  { name: 'Lady Kemma', slug: 'lady-kemma', id: 288236 },
  { name: 'Hudson', slug: 'hudson', id: 288237 },
  { name: 'Orlando', slug: 'orlando', id: 288238 },
  { name: 'Joseph', slug: 'joseph', id: 288239 },
  { name: 'Rocco', slug: 'rocco', id: 288240 },
  { name: 'Castelo Branco', slug: 'castelo-branco', id: 288241 },
  { name: 'Maddox', slug: 'maddox', id: 288242 },
  { name: 'Elias', slug: 'elias', id: 288243 },
  { name: 'Bonac', slug: 'bonac', id: 288244 },
  { name: 'Genie', slug: 'genie', id: 288245 },
  { name: 'George', slug: 'george', id: 288246 },
  { name: 'Conrad', slug: 'conrad', id: 288247 },
  { name: 'Ciona', slug: 'ciona', id: 288248 },
  { name: 'Manhattan', slug: 'manhattan', id: 288249 },
  { name: 'Bailey', slug: 'bailey', id: 288250 },
  { name: 'Harry Etta', slug: 'harry-etta', id: 288251 },
  { name: 'Sandy Lu', slug: 'sandy-lu', id: 288252 },
  { name: 'Rizzilient', slug: 'rizzilient', id: 288253 },
  { name: 'Maya', slug: 'maya', id: 288254 },
  { name: 'ANZAC', slug: 'anzac', id: 288255 },
  { name: 'Maia', slug: 'maia', id: 288256 },
  { name: 'Susan', slug: 'susan', id: 288257 },
  { name: 'Hal', slug: 'hal', id: 288258 },
  { name: 'Viper', slug: 'viper', id: 288259 },
  { name: 'CubsWin', slug: 'cubswin', id: 288260 },
  { name: 'Leon III', slug: 'leon-iii', id: 288261 },
  { name: 'AB', slug: 'ab', id: 288262 },
  { name: 'Beatriz', slug: 'beatriz', id: 288263 },
  { name: 'Miss Lillie', slug: 'miss-lillie', id: 288264 },
  { name: 'Carl', slug: 'carl', id: 288265 },
  { name: 'Oprah', slug: 'oprah', id: 288266 },
  { name: 'Maroochy', slug: 'maroochy', id: 288267 },
  { name: 'Crystal (Tiger)', slug: 'crystal-tiger', id: 288268 },
  { name: 'Savannah', slug: 'savannah', id: 288270 },
  { name: 'Lal', slug: 'lal', id: 288271 },
  { name: 'Cate Ells', slug: 'cate-ells', id: 288272 },
  { name: 'Venus', slug: 'venus', id: 288274 },
  { name: 'Laurel Jean', slug: 'laurel-jean', id: 288276 },
  { name: 'Trinity', slug: 'trinity', id: 288277 },
  { name: 'Beaufort', slug: 'beaufort', id: 288278 },
  { name: 'Louise', slug: 'louise', id: 288279 },
  { name: 'Bec Piper', slug: 'bec-piper', id: 288280 },
  { name: 'Alice', slug: 'alice', id: 288281 },
  { name: 'Harvey', slug: 'harvey', id: 288282 },
  { name: 'Isabela', slug: 'isabela', id: 288283 },
  { name: 'Azlyn', slug: 'azlyn', id: 288285 },
  { name: 'Melanie', slug: 'melanie', id: 288286 },
  { name: 'Kathryn', slug: 'kathryn', id: 288287 },
  { name: 'Chessie', slug: 'chessie', id: 288288 },
  { name: 'Marcella', slug: 'marcella', id: 288290 },
  { name: 'Sofia', slug: 'sofia', id: 288291 },
  { name: 'Gratitude', slug: 'gratitude', id: 288292 },
  { name: 'Harry Ette', slug: 'harry-ette', id: 288293 },
  { name: 'Marilin', slug: 'marilin', id: 288294 },
  { name: 'Success', slug: 'success', id: 288295 },
  { name: 'Elaia', slug: 'elaia', id: 288296 },
  { name: 'Shayna', slug: 'shayna', id: 288297 },
  { name: 'Aussie', slug: 'aussie', id: 288298 },
  { name: 'Luis', slug: 'luis', id: 288299 },
  { name: 'Lydia', slug: 'lydia', id: 288300 },
  { name: 'Zuza', slug: 'zuza', id: 288301 },
  { name: 'Sherril', slug: 'sherril', id: 288302 },
  { name: 'Mariela', slug: 'mariela', id: 288303 },
  { name: 'Jedda', slug: 'jedda', id: 288304 },
  { name: 'Lonesome Jorgita', slug: 'lonesome-jorgita', id: 288305 },
  { name: 'Leeuwin', slug: 'leeuwin', id: 288306 },
  { name: 'Naia', slug: 'naia', id: 288307 },
  { name: 'Hannah', slug: 'hannah', id: 288308 },
  { name: 'Emily', slug: 'emily', id: 288309 },
  { name: 'Sabrina', slug: 'sabrina', id: 288310 },
  { name: 'Jessica', slug: 'jessica', id: 288311 },
  { name: 'Corale', slug: 'corale', id: 288312 },
  { name: 'Sellendilloh', slug: 'sellendilloh', id: 288313 },
  { name: 'Polymnia', slug: 'polymnia', id: 288314 },
  { name: 'Bevan', slug: 'bevan', id: 288315 },
  { name: 'Hunter', slug: 'hunter', id: 288316 },
  { name: 'Lazarus', slug: 'lazarus', id: 288317 },
  { name: 'Brunswick I', slug: 'brunswick-i', id: 288318 },
  { name: 'Thalia', slug: 'thalia', id: 288320 },
  { name: 'Lori Anne', slug: 'lori-anne', id: 288321 },
  { name: 'Andrea', slug: 'andrea', id: 288322 },
  { name: 'CHIPS', slug: 'chips', id: 288323 },
  { name: 'Mission', slug: 'mission', id: 288324 },
  { name: 'Lando', slug: 'lando', id: 288325 },
  { name: 'Errol Finn', slug: 'errol-finn', id: 288326 },
  { name: 'Sunny', slug: 'sunny', id: 288327 },
  { name: 'Ned', slug: 'ned', id: 288328 },
  { name: 'Hobbs', slug: 'hobbs', id: 288330 },
  { name: 'Olivia', slug: 'olivia', id: 288331 },
  { name: 'Miss Costa', slug: 'miss-costa', id: 288332 },
  { name: 'Katharine', slug: 'katharine', id: 288333 },
  { name: 'Weimar', slug: 'weimar', id: 288334 },
  { name: 'Berlanga', slug: 'berlanga', id: 288335 },
  { name: 'Nickol', slug: 'nickol', id: 288336 },
  { name: 'Teddy', slug: 'teddy', id: 288337 },
  { name: 'Vindication', slug: 'vindication', id: 288338 },
  { name: 'Lemanja', slug: 'lemanja', id: 288339 },
  { name: 'Sage', slug: 'sage', id: 288340 },
  { name: 'Finn', slug: 'finn', id: 288341 },
  { name: 'Sereia', slug: 'sereia', id: 288342 },
  { name: 'Mackay', slug: 'mackay', id: 288343 },
  { name: 'Sero', slug: 'sero', id: 288344 },
  { name: 'Helen', slug: 'helen', id: 288345 },
  { name: 'Tupi', slug: 'tupi', id: 288346 },
  { name: 'Caroline Mae', slug: 'caroline-mae', id: 288347 },
  { name: 'Enric', slug: 'enric', id: 288348 },
  { name: 'Pat', slug: 'pat', id: 288349 },
  { name: 'Tony', slug: 'tony', id: 288350 },
  { name: 'Jacob', slug: 'jacob', id: 288351 },
  { name: 'iSimangaliso', slug: 'isimangaliso', id: 288352 },
  { name: 'Jefferson', slug: 'jefferson', id: 288354 },
  { name: 'Dr Brent', slug: 'dr-brent', id: 288355 },
  { name: 'Betsy', slug: 'betsy', id: 288356 },
  { name: 'Judy', slug: 'judy', id: 288357 },
  { name: 'Jill', slug: 'jill', id: 288358 },
  { name: 'Miss May', slug: 'miss-may', id: 288359 },
  { name: 'Riley', slug: 'riley', id: 288360 },
  { name: 'Jon', slug: 'jon', id: 288362 },
  { name: 'GBR1', slug: 'gbr1', id: 288363 },
  { name: 'Canyon', slug: 'canyon', id: 288364 },
  { name: 'Catalina', slug: 'catalina', id: 288365 },
  { name: 'Alberto', slug: 'alberto', id: 288366 },
  { name: 'Singles You Up', slug: 'singles-you-up', id: 288367 },
  { name: 'Poseidon', slug: 'poseidon', id: 288368 },
  { name: 'Jaimie', slug: 'jaimie', id: 288371 },
  { name: 'Borinquena', slug: 'borinquena', id: 288372 },
  { name: 'Finley', slug: 'finley', id: 288373 },
  { name: 'Charli', slug: 'charli', id: 288374 },
  { name: 'Azul', slug: 'azul', id: 288375 },
  { name: 'Shelly', slug: 'shelly', id: 288376 },
  { name: 'Hans', slug: 'hans', id: 288377 },
  { name: 'Siegi', slug: 'siegi', id: 288378 },
  { name: 'Itabaca', slug: 'itabaca', id: 288379 },
  { name: 'Martie', slug: 'martie', id: 288380 },
  { name: 'Hilton', slug: 'hilton', id: 288381 },
  { name: 'Adelaide', slug: 'adelaide', id: 288382 },
  { name: 'Jax', slug: 'jax', id: 288384 },
  { name: 'Isabella', slug: 'isabella', id: 288385 },
  { name: 'Irma', slug: 'irma', id: 288386 },
  { name: 'Maureen', slug: 'maureen', id: 288387 },
  { name: 'Cathy', slug: 'cathy', id: 288388 },
  { name: 'Cabot', slug: 'cabot', id: 288389 },
  { name: 'Thalassa', slug: 'thalassa', id: 288390 },
  { name: 'Brenda', slug: 'brenda', id: 288391 },
  { name: 'Quang', slug: 'quang', id: 288392 },
  { name: 'Gabriela', slug: 'gabriela', id: 288393 },
  { name: 'Don', slug: 'don', id: 288394 },
  { name: 'Yolanda', slug: 'yolanda', id: 288396 },
  { name: 'Peggy Hughes', slug: 'peggy-hughes', id: 288397 },
  { name: 'Princess', slug: 'princess', id: 288398 },
  { name: 'Kimberley', slug: 'kimberley', id: 288399 },
  { name: 'Milt', slug: 'milt', id: 288400 },
  { name: 'Perseverance', slug: 'perseverance', id: 288401 },
  { name: 'Caroline', slug: 'caroline', id: 288402 },
  { name: 'Helena', slug: 'helena', id: 288403 },
  { name: 'Miguel', slug: 'miguel', id: 288404 },
  { name: 'Madiba', slug: 'madiba', id: 288405 },
  { name: 'Jane', slug: 'jane', id: 288407 },
  { name: 'Thomas', slug: 'thomas', id: 288408 },
  { name: 'MacAttack', slug: 'macattack', id: 288409 },
  { name: 'Pico', slug: 'pico', id: 288410 },
  { name: 'Brunswick', slug: 'brunswick', id: 288411 },
  { name: 'Norris', slug: 'norris', id: 288412 },
  { name: 'Ema', slug: 'ema', id: 288413 },
  { name: 'Gotham', slug: 'gotham', id: 288414 },
  { name: 'Sam Houston', slug: 'sam-houston', id: 288415 },
  { name: 'Bigelow', slug: 'bigelow', id: 288416 },
  { name: 'Gina', slug: 'gina', id: 288417 },
  { name: 'Margarita', slug: 'margarita', id: 288418 },
  { name: 'Holly', slug: 'holly', id: 288419 },
  { name: 'Cyndi', slug: 'cyndi', id: 288420 },
  { name: 'Neda', slug: 'neda', id: 288421 },
  { name: 'Iris', slug: 'iris', id: 288422 },
  { name: 'Paumanok', slug: 'paumanok', id: 288423 },
  { name: 'Gurney', slug: 'gurney', id: 288424 },
  { name: 'Erica', slug: 'erica', id: 288425 },
  { name: 'Lexi', slug: 'lexi', id: 288427 },
  { name: 'Mary Lee', slug: 'mary-lee', id: 288428 },
  { name: 'Dr Pam', slug: 'dr-pam', id: 288429 },
  { name: 'Sylvia', slug: 'sylvia', id: 288430 },
  { name: 'Amagansett', slug: 'amagansett', id: 288431 },
  { name: 'Gisela', slug: 'gisela', id: 288432 },
  { name: 'Lampiao', slug: 'lampiao', id: 288434 },
  { name: 'Gnaraloo', slug: 'gnaraloo', id: 288435 },
  { name: 'Thetis', slug: 'thetis', id: 288436 },
  { name: 'Vader', slug: 'vader', id: 288437 },
  { name: 'Peggy', slug: 'peggy', id: 288438 },
  { name: 'Chris Nic', slug: 'chris-nic', id: 288439 },
  { name: 'Melodi', slug: 'melodi', id: 288440 },
  { name: 'Bill Nye', slug: 'bill-nye', id: 288441 },
  { name: 'Gareth', slug: 'gareth', id: 288443 },
  { name: 'Buddy', slug: 'buddy', id: 288444 },
  { name: 'Encantada', slug: 'encantada', id: 288445 },
  { name: 'Captain Wayne', slug: 'captain-wayne', id: 288446 },
  { name: 'Nemo', slug: 'nemo', id: 288447 },
  { name: 'Ingo', slug: 'ingo', id: 288448 },
  { name: 'Orlandinho', slug: 'orlandinho', id: 288449 },
  { name: 'Big Kahuna', slug: 'big-kahuna', id: 288450 },
  { name: 'Johnny', slug: 'johnny', id: 288451 },
  { name: 'Michelle', slug: 'michelle', id: 288452 },
  { name: 'Sylvia Saez', slug: 'sylvia-saez', id: 288453 },
  { name: 'Amy', slug: 'amy', id: 288454 },
  { name: 'SouthJaw', slug: 'southjaw', id: 288455 },
  { name: 'Kekoa', slug: 'kekoa', id: 288456 },
  { name: 'Laura', slug: 'laura', id: 288457 },
  { name: 'Andre', slug: 'andre', id: 288458 },
  { name: 'Clara', slug: 'clara', id: 288459 },
  { name: 'Redemption', slug: 'redemption', id: 288460 },
  { name: 'Harmony', slug: 'harmony', id: 288461 },
  { name: 'Duke', slug: 'duke', id: 288462 },
  { name: 'Sally', slug: 'sally', id: 288463 },
  { name: 'Alisha', slug: 'alisha', id: 288464 },
  { name: 'Yinzer', slug: 'yinzer', id: 288465 },
  { name: 'Mahkato', slug: 'mahkato', id: 288466 },
  { name: 'Cisco', slug: 'cisco', id: 288467 },
  { name: 'Gale', slug: 'gale', id: 288468 },
  { name: 'Bruin', slug: 'bruin', id: 288469 },
  { name: 'Sawtooth', slug: 'sawtooth', id: 288470 },
  { name: 'Georgia', slug: 'georgia', id: 288471 },
  { name: 'Floreana', slug: 'floreana', id: 288472 },
  { name: 'Yolanda', slug: 'yolanda', id: 288473 },
  { name: 'Philip', slug: 'philip', id: 288474 },
  { name: 'Oscar', slug: 'oscar', id: 288475 },
  { name: 'Nova', slug: 'nova', id: 288476 },
  { name: 'Posidonia', slug: 'posidonia', id: 288477 },
  { name: 'Susan', slug: 'susan', id: 288478 },
  { name: 'Vera', slug: 'vera', id: 288479 },
  { name: 'Hampton', slug: 'hampton', id: 288480 },
  { name: 'Edith', slug: 'edith', id: 288481 },
  { name: 'Luna', slug: 'luna', id: 288482 },
  { name: 'Kate', slug: 'kate', id: 288483 },
  { name: 'Carolina', slug: 'carolina', id: 288484 },
  { name: 'Madeline', slug: 'madeline', id: 288485 },
  { name: 'Nicole', slug: 'nicole', id: 288486 },
  { name: 'Caroline', slug: 'caroline', id: 288488 },
  { name: 'Lesley', slug: 'lesley', id: 288489 },
  { name: 'Wyatt', slug: 'wyatt', id: 288490 },
  { name: 'Miss Michalove', slug: 'miss-michalove', id: 288491 },
  { name: 'Freo', slug: 'freo', id: 288492 },
  { name: 'Fritz', slug: 'fritz', id: 288493 },
  { name: 'Katya (tiger shark)', slug: 'katya-tiger-shark', id: 288494 },
  { name: 'Anne Morrow', slug: 'anne-morrow', id: 288495 },
  { name: 'Nico', slug: 'nico', id: 288496 },
  { name: 'Reveille', slug: 'reveille', id: 288497 },
  { name: 'Courage', slug: 'courage', id: 288498 },
  { name: 'Montauk', slug: 'montauk', id: 288499 },
  { name: 'Einstein', slug: 'einstein', id: 288500 },
  { name: 'Diane', slug: 'diane', id: 288501 },
  { name: 'Red', slug: 'red', id: 288502 },
  { name: 'Warne', slug: 'warne', id: 288503 },
  { name: 'Cypress', slug: 'cypress', id: 288504 },
  { name: 'Ningaloo', slug: 'ningaloo', id: 288505 },
  { name: 'Perth', slug: 'perth', id: 288506 },
  { name: 'Audrey Laine', slug: 'audrey-laine', id: 288507 },
  { name: 'Faith', slug: 'faith', id: 288508 },
  { name: 'YETI', slug: 'yeti', id: 288509 },
  { name: 'Zac', slug: 'zac', id: 288510 },
  { name: 'Buzz', slug: 'buzz', id: 288511 },
  { name: 'Albert', slug: 'albert', id: 288512 },
  { name: 'Guayasamin', slug: 'guayasamin', id: 288513 },
  { name: 'Gurthrude', slug: 'gurthrude', id: 288514 },
  { name: 'The Judge', slug: 'the-judge', id: 288515 },
  { name: 'Daymond', slug: 'daymond', id: 288516 },
  { name: 'Edna', slug: 'edna', id: 288517 },
  { name: 'Duval', slug: 'duval', id: 288518 },
  { name: 'Rocky Mazzanti', slug: 'rocky-mazzanti', id: 288519 },
  { name: 'Bindi', slug: 'bindi', id: 288520 },
  { name: 'Manuelita', slug: 'manuelita', id: 288521 },
  { name: 'April', slug: 'april', id: 288523 },
  { name: 'Sydney', slug: 'sydney', id: 288689 },
  { name: 'Murdoch', slug: 'murdoch', id: 289874 },
  { name: 'Unama\'ki', slug: 'unamaki', id: 290985 },
  { name: 'Doug', slug: 'doug', id: 303706 },
  { name: 'Mario', slug: 'mario', id: 303707 },
  { name: 'Caper', slug: 'caper', id: 303708 },
  { name: 'Max', slug: 'max', id: 305537 },
  { name: 'Shaw', slug: 'shaw', id: 305547 },
  { name: 'Ferg', slug: 'ferg', id: 305548 },
  { name: 'Scotia', slug: 'scotia', id: 305549 },
  { name: 'Teazer', slug: 'teazer', id: 305550 },
  { name: 'Ironbound', slug: 'ironbound', id: 308724 },
  { name: 'Vimy', slug: 'vimy', id: 308731 },
  { name: 'Oliver', slug: 'oliver', id: 309147 },
  { name: 'Simone', slug: 'simone', id: 309149 },
  { name: 'Anthony', slug: 'anthony', id: 309150 },
  { name: 'Bluenose', slug: 'bluenose', id: 367202 },
  { name: 'Holly', slug: 'holly', id: 384777 },
  { name: 'Zake', slug: 'zake', id: 384778 },
  { name: 'Alara', slug: 'alara', id: 384779 },
  { name: 'Jaap', slug: 'jaap', id: 384780 },
  { name: 'Lisa Christina', slug: 'lisa-christina', id: 384781 },
  { name: 'Belinda', slug: 'belinda', id: 384782 },
  { name: 'Grizz', slug: 'grizz', id: 405769 },
  { name: 'Hanna Marie', slug: 'hanna-marie', id: 405770 },
  { name: 'Fitzy', slug: 'fitzy', id: 406534 },
  { name: 'Headstone', slug: 'headstone', id: 406535 },
  { name: 'Miamiti', slug: 'miamiti', id: 406742 },
  { name: 'David', slug: 'david', id: 406789 },
  { name: 'Emma', slug: 'emma', id: 406793 },
  { name: 'Amy', slug: 'amy', id: 406820 },
  { name: 'Fletcher', slug: 'fletcher', id: 407072 },
  { name: 'Tintoela', slug: 'tintoela', id: 412932 },
  { name: 'Koru', slug: 'koru', id: 413146 },
  { name: 'Katya', slug: 'katya', id: 422455 },
  { name: 'Evelyn', slug: 'evelyn', id: 485395 },
  { name: 'Junonia', slug: 'junonia', id: 509160 },
  { name: 'Andromache', slug: 'andromache', id: 530006 },
  { name: 'Martha', slug: 'martha', id: 535571 },
  { name: 'Beacon', slug: 'beacon', id: 535575 },
  { name: 'Norfolk', slug: 'norfolk', id: 538048 },
  { name: 'Breton', slug: 'breton', id: 544541 },
  { name: 'Gladee', slug: 'gladee', id: 550002 },
  { name: 'Hirtle', slug: 'hirtle', id: 550003 },
  { name: 'Nukumi', slug: 'nukumi', id: 551127 },
  { name: 'Mahone', slug: 'mahone', id: 552908 },
  { name: 'Rose', slug: 'rose', id: 552909 },
  { name: 'Acadia', slug: 'acadia', id: 552910 },
  { name: 'Edithe', slug: 'edithe', id: 553908 },
  { name: 'Monomoy', slug: 'monomoy', id: 553910 },
  { name: 'Sterling', slug: 'sterling', id: 630211 },
  { name: 'Bubba-3', slug: 'bubba-3', id: 655054 },
  { name: 'Kate', slug: 'kate', id: 655105 },
  { name: 'Collette', slug: 'collette', id: 655106 },
  { name: 'Bryce', slug: 'bryce', id: 655110 },
  { name: 'Nomad', slug: 'nomad', id: 655117 },
  { name: 'Phillip', slug: 'phillip', id: 657935 },
  { name: 'Nepean', slug: 'nepean', id: 657952 },
  { name: 'Freidi', slug: 'freidi', id: 658080 },
  { name: 'Freya', slug: 'freya', id: 658443 },
  { name: 'Geoff', slug: 'geoff', id: 662567 },
  { name: 'Charlotte', slug: 'charlotte', id: 662714 },
  { name: 'Isla Belle', slug: 'isla-belle', id: 663081 },
  { name: 'Buc-ee', slug: 'buc-ee', id: 663199 },
  { name: 'BobHayes', slug: 'bobhayes', id: 663200 },
  { name: 'Fast Ball', slug: 'fast-ball', id: 663201 },
  { name: 'Slinger', slug: 'slinger', id: 663218 },
  { name: 'Laureen', slug: 'laureen', id: 663219 },
  { name: 'Nancy', slug: 'nancy', id: 663738 },
  { name: 'Jap', slug: 'jap', id: 663822 },
  { name: 'Scotty 2', slug: 'scotty-2', id: 711247 },
  { name: 'Nehsi', slug: 'nehsi', id: 714085 },
  { name: 'Stann', slug: 'stann', id: 812695 },
  { name: 'El Tigre', slug: 'el-tigre', id: 812696 },
  { name: 'Alan', slug: 'alan', id: 812697 },
  { name: 'Belekin', slug: 'belekin', id: 812698 },
  { name: 'Saki', slug: 'saki', id: 813615 },
  { name: 'Perla', slug: 'perla', id: 817675 },
  { name: 'Olympia', slug: 'olympia', id: 842511 },
  { name: 'Tuck', slug: 'tuck', id: 842512 },
  { name: 'Santiago', slug: 'santiago', id: 843214 },
  { name: 'Lil\' Smack', slug: 'lil-smack', id: 847691 },
  { name: 'Scot', slug: 'scot', id: 858430 },
  { name: 'Sable', slug: 'sable', id: 859287 },
  { name: 'Hali', slug: 'hali', id: 865112 },
  { name: 'Sarah', slug: 'sarah', id: 865246 },
  { name: 'Ulysses', slug: 'ulysses', id: 865303 },
  { name: 'Maple', slug: 'maple', id: 865390 },
  { name: 'Sail', slug: 'sail', id: 866912 },
  { name: 'Bob', slug: 'bob', id: 867210 },
  { name: 'Tancook', slug: 'tancook', id: 867480 },
  { name: 'Keji', slug: 'keji', id: 867481 },
  { name: 'Flower', slug: 'flower', id: 867785 },
  { name: 'Pete', slug: 'pete', id: 885626 },
  { name: 'Zozo', slug: 'zozo', id: 885628 },
  { name: 'Z-River', slug: 'z-river', id: 885795 },
  { name: 'Chloe', slug: 'chloe', id: 894870 },
  { name: 'Ali', slug: 'ali', id: 985813 },
  { name: 'Blancpain', slug: 'blancpain', id: 985814 },
  { name: 'Fifty Fathoms', slug: 'fifty-fathoms', id: 985851 },
  { name: 'Alexios', slug: 'alexios', id: 987168 },
  { name: 'Kimmy', slug: 'kimmy', id: 1100935 },
  { name: 'Tinka', slug: 'tinka', id: 1100943 },
  { name: 'Jens', slug: 'jens', id: 1100944 },
  { name: 'Sharky McShark Face', slug: 'sharky-mcshark-face', id: 1100946 },
  { name: 'Suki', slug: 'suki', id: 1100952 },
  { name: 'Jess', slug: 'jess', id: 1100966 },
  { name: 'Birgit', slug: 'birgit', id: 1100989 },
  { name: 'Rocket', slug: 'rocket', id: 1101252 },
  { name: 'Lacky', slug: 'lacky', id: 1101253 },
  { name: 'Aatuti', slug: 'aatuti', id: 1101254 },
  { name: 'Robert', slug: 'robert', id: 1101388 },
  { name: 'Theodosia', slug: 'theodosia', id: 1101543 },
  { name: 'Nate', slug: 'nate', id: 1101589 },
  { name: 'Tigger', slug: 'tigger', id: 1104738 },
  { name: 'Ali-Bel', slug: 'ali-bel', id: 1106959 },
  { name: 'Crystal', slug: 'crystal', id: 1167289 },
  { name: 'Simon', slug: 'simon', id: 1479798 },
  { name: 'Ormond', slug: 'ormond', id: 1480119 },
  { name: 'Jekyll', slug: 'jekyll', id: 1480814 },
  { name: 'Frosty', slug: 'frosty', id: 1483470 },
  { name: 'Anne Bonny', slug: 'anne-bonny', id: 1561596 },
  { name: 'Ocracoke', slug: 'ocracoke', id: 1561597 },
  { name: 'Penny', slug: 'penny', id: 1561937 },
  { name: 'B.P. Armstrong', slug: 'bp-armstrong', id: 2015262 },
  { name: 'Buffett', slug: 'buffett', id: 2106508 },
  { name: 'Caroline (Sea Turtle)', slug: 'caroline-sea-turtle', id: 2106696 },
  { name: 'Windy', slug: 'windy', id: 2107356 },
  { name: 'Bootes', slug: 'bootes', id: 2108458 },
  { name: 'Patricia', slug: 'patricia', id: 2108767 },
  { name: 'Eleanor', slug: 'eleanor', id: 2108876 },
  { name: 'Lemon Drop', slug: 'lemon-drop', id: 2108890 },
  { name: 'Dolly2', slug: 'dolly2', id: 2108894 },
  { name: 'Pearl', slug: 'pearl', id: 2108895 },
  { name: 'Therese', slug: 'therese', id: 2108901 },
  { name: 'Cecil', slug: 'cecil', id: 2108922 },
  { name: 'Marie', slug: 'marie', id: 2108932 },
  { name: 'Brianna', slug: 'brianna', id: 2108935 },
  { name: 'Urdintxo', slug: 'urdintxo', id: 2139731 },
  { name: 'Félix', slug: 'felix', id: 2141156 },
  { name: 'Kando', slug: 'kando', id: 2344827 },
  { name: 'Danny', slug: 'danny', id: 2344838 },
  { name: 'Contender', slug: 'contender', id: 2344847 },
  { name: 'Dold', slug: 'dold', id: 2361676 },
  { name: 'Morada', slug: 'morada', id: 2431093 },
  { name: 'Hanna', slug: 'hanna', id: 2431784 },
  { name: 'Mira', slug: 'mira', id: 2548468 },
  { name: 'Jason', slug: 'jason', id: 2789925 },
  { name: 'Bella', slug: 'bella', id: 2790721 },
  { name: 'Baker', slug: 'baker', id: 2790722 },
  { name: 'Quint', slug: 'quint', id: 2794989 },
  { name: 'Percy', slug: 'percy', id: 2803818 },
  { name: 'Cayo', slug: 'cayo', id: 2812382 },
  { name: 'Wassaw Will', slug: 'wassaw-will', id: 2812557 },
  { name: 'Lillian-Hazel', slug: 'lillian-hazel', id: 2812565 },
  { name: 'Kegan-Magnolia', slug: 'kegan-magnolia', id: 2812567 },
  { name: 'Niabi', slug: 'niabi', id: 2832241 },
  { name: 'Brookes', slug: 'brookes', id: 2881663 },
  { name: 'Webster', slug: 'webster', id: 2883372 },
  { name: 'Ripple', slug: 'ripple', id: 2884021 },
  { name: 'Goodall', slug: 'goodall', id: 2885826 },
  { name: 'Nori', slug: 'nori', id: 2885995 },
  { name: 'Brass Bed', slug: 'brass-bed', id: 2886160 },
  { name: 'Ernst', slug: 'ernst', id: 2886164 },
  { name: 'Cross', slug: 'cross', id: 2886165 },
  { name: 'Serena', slug: 'serena', id: 2893202 },
  { name: 'LYS', slug: 'lys', id: 3467308 },
  { name: 'Toño', slug: 'tono', id: 3470603 },
  { name: 'Tupelo', slug: 'tupelo', id: 3551617 },
  { name: 'Tallulah', slug: 'tallulah', id: 3552504 },
  { name: 'Priscilla', slug: 'priscilla', id: 3552505 },
  { name: 'Brie', slug: 'brie', id: 3665757 },
  { name: 'Pesto', slug: 'pesto', id: 3665775 },
  { name: 'Parm', slug: 'parm', id: 3665776 },
  { name: 'Mozzarella', slug: 'mozzarella', id: 3665777 },
  { name: 'Elsa', slug: 'elsa', id: 3665866 },
  { name: 'Theresa', slug: 'theresa', id: 3800603 },
];

const OUTPUT_FILE = path.join(__dirname, 'trails.json');

// How many sharks to scrape at the same time. Higher = faster but heavier.
// 4-5 is a good balance; bump to 6-8 on a fast machine + connection.
const CONCURRENCY = 5;

(async () => {
  console.log('🦈 OCEARCH Trail Scraper (parallel)');
  console.log('===================================');

  let results = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    results = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    console.log(`Loaded ${Object.keys(results).length} existing trails`);
  }

  // Re-fetch animals whose cached data is stale (or missing). This keeps trails
  // current instead of caching them forever. Set REFRESH_ALL=1 to force-refresh all.
  const STALE_HOURS = 20;
  const now = Date.now();
  const forceAll = process.env.REFRESH_ALL === '1';
  const todo = ANIMALS.filter(a => {
    const cached = results[a.id];
    if (!cached || !(cached.motion?.length > 0)) return true;     // missing data
    if (forceAll) return true;
    const ageHours = (now - (cached.fetchedAt || 0)) / 3.6e6;     // no stamp => infinitely old
    return ageHours >= STALE_HOURS;                               // stale => refresh
  });
  const skipped = ANIMALS.length - todo.length;
  console.log(`${todo.length} to fetch, ${skipped} fresh (cached < ${STALE_HOURS}h), ${CONCURRENCY} at a time\n`);

  if (todo.length === 0) {
    console.log('Everything is fresh (recently scraped)! Running bake...');
    require('./bake.js');
    return;
  }

  const launchOpts = process.env.CI
    ? { headless: true }                       // GitHub Actions: use bundled Chromium
    : { channel: 'chrome', headless: true };   // Local: use your installed Chrome
  const browser = await chromium.launch(launchOpts);

  let success = 0, failed = 0, done = 0;
  const startTime = Date.now();

  // Worker: processes animals from a shared queue
  const queue = [...todo];
  async function worker(workerId) {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    // Block heavy resources we don't need — big speedup
    await page.route('**/*', route => {
      const type = route.request().resourceType();
      const url = route.request().url();
      if (['image', 'font', 'media', 'stylesheet'].includes(type) ||
          url.includes('google') || url.includes('hubspot') || url.includes('hsadspixel') ||
          url.includes('sentry') || url.includes('hotjar') || url.includes('doubleclick') ||
          url.includes('windy') || url.includes('cloudflareinsights') || url.includes('fndrsp')) {
        return route.abort();
      }
      route.continue();
    });

    while (queue.length > 0) {
      const animal = queue.shift();
      if (!animal) break;

      // Set up a promise that resolves when this animal's data arrives
      let resolveData;
      const dataPromise = new Promise(res => { resolveData = res; });

      const handler = async (response) => {
        const url = response.url();
        if (url.includes(`/pois/${animal.id}/motion/with-meta/`)) {
          try {
            const data = await response.json();
            if (data.motion?.length > 0) {
              results[animal.id] = { name: animal.name, motion: data.motion, log: data.log, fetchedAt: Date.now() };
              fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results));
              resolveData(data.motion.length);
            }
          } catch (e) {}
        }
      };
      page.on('response', handler);

      try {
        // Navigate; don't wait for full networkidle, just DOM + the data response
        await page.goto(`https://www.ocearch.org/tracker/detail/${animal.slug}`, {
          waitUntil: 'domcontentloaded', timeout: 40000
        });
        // Wait up to 12s for the data response (or resolve early when it arrives)
        const pings = await Promise.race([
          dataPromise,
          new Promise(res => setTimeout(() => res(null), process.env.CI ? 20000 : 12000)),
        ]);

        done++;
        const pct = Math.round(100 * done / todo.length);
        if (pings) {
          success++;
          console.log(`[${pct}%] ✅ ${animal.name} — ${pings} pings`);
        } else {
          failed++;
          console.log(`[${pct}%] ⚠ ${animal.name} — no data`);
        }
      } catch (e) {
        done++;
        failed++;
        console.log(`[${Math.round(100*done/todo.length)}%] ❌ ${animal.name} — ${e.message.split('\n')[0]}`);
      } finally {
        page.off('response', handler);
      }
    }

    await context.close();
  }

  // Launch workers in parallel
  const workers = [];
  for (let i = 0; i < Math.min(CONCURRENCY, todo.length); i++) {
    workers.push(worker(i));
  }
  await Promise.all(workers);

  await browser.close();

  const secs = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n===================================`);
  console.log(`✅ ${success} fetched, ${failed} failed in ${secs}s`);
  console.log(`Total trails: ${Object.keys(results).length}`);

  if (Object.keys(results).length > 0) {
    console.log('\nBaking into tracker...');
    require('./bake.js');
  }
})();
