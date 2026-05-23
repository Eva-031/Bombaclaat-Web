#include "Bombaclaat.h"
#include "Bombaclaat.cpp"
int main() {
    cout << "Welcome to BOMBACLAAT!\n";
    BomberBoard game;
    game.init();

    bool isPlaying = true;
    while (isPlaying) {
        isPlaying = game.handleInput();
    }

    cout << "Game Over!\n";
    return 0;
}