//Q1

struct Roulement
{
    char id[6];
    float dint;
    int dext;
};

typedef struct Roulement roulement;

//Q2

#include <string.h>

roulement creerRoulement(char *id, float dint, int dext)
{
    //Prends en argument les paramètres d'un roulement, crée le roulement,
    //lui attribue les paramètres passés en argument avant de le renvoyer
    roulement r;
    strcpy(r.id, id);
    r.dint = dint;
    r.dext = dext;

    return r;
}

//Q3

void ajoutRoulement(roulement r, roulement *roulements, int *n)
{
    //on passe par adresse le nombre de roulements (n) contenus dans le tableau roulements
    //puis on l'incrémente
    roulements[*n] = r;
    *n++;
}

//Q4

#include <string.h>

#define N 50

roulement chercheRoulement(char *id, roulement *roulements, int *i) //le paramètre *i sert dans la dernière question à récupérer l'index du roulement RRG12
{
    //on suppose que le tableau roulements contient au plus N = 50 roulement
    for (*i = 0; *i < N; *i++)
        if (!strcmp(roulements[*i].id, id)) // équivalent à strcmp(.., ..) == 0
            return roulements[*i];

    return (roulement) {"", 0, 0}; //valeur de retour par défaut (cast sur type roulement)
}

//Q5

#include <stdio.h>

void afficheTRoulements(roulement *roulements, int *n)
{
    printf("%s\t%f\t%d\n", roulements[*n].id, roulements[*n].dint, roulements[*n].dext);
    if (*n--) afficheTRoulements(roulements, n); //post décrementation de *n : on vérifie que n > 0 avant de le décrémenter
}

//Q6

#include <stdio.h>
#include <string.h>

#define N 50

int main()
{
    roulement *TRoulement[N];
    int *nbRoulements = 0;

    roulement r = creerRoulement("abcde", 10., 30);
    ajoutRoulement(r, TRoulement, nbRoulements);
    afficheTRoulements(TRoulement, nbRoulements);

    return 0;
}

//Q7

struct MaillonRoulement
{
    struct MaillonRoulement *suiv;
    roulement info;
};

typedef struct MaillonRoulement TypeMaillonRoulement;
typedef struct MaillonRoulement TMR; // trop long

//Q8

#include <stdlib.h>

void ajoutRoulementListe(roulement r, TMR *roulements)
{
    //création dynamique d'un maillon puis mise en tête de liste
    TMR *m = (TMR*) malloc(sizeof(TMR));
    m->info = r;
    m->suiv = roulements;
    roulements = m;
}

//Q9

#include <stdlib.h>
#include <string.h>

roulement chercheRoulementListe(char *id, TMR *roulements)
{
    //parcours itératif de la liste avec une boucle while
    TMR *m = (TMR*) malloc(sizeof(TMR));
    m = roulements;
    while (m != NULL)
    {
        if (!strcmp((m->info).id, id)) return m->info;
        m = m->suiv;
    }

    return (roulement) {"", 0, 0}; //valeur de retour par défaut
}

//Q10

#include <stdio.h>

void afficheRoulementListe(TMR *roulements)
{
    printf("%s\t%f\t%d\n", (roulements->info).id, (roulements->info).dint, (roulements->info).dext);
    if (roulements->suiv != NULL) afficheRoulementListe(roulements->suiv);
}

//Q11

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main()
{
    int *nbRoulements;
    roulement *TRoulements;
    //... (on suppose que l'on se trouve à la suite du main précédent (connaissance de *nbRoulements))
    TMR *LRoulements = (TMR*) malloc(sizeof(TMR));
    int i;
    
    for (i = 0; i < *nbRoulements; i++)
        ajoutRoulementListe(TRoulements[i], LRoulements);

    afficheRoulementListe(LRoulements);

    return 0;
}

//Q12

#include <stdio.h>

void ecrireTabRoulements(char *fichier, roulement *roulements, int *n)
{
    FILE *pf = fopen(fichier, "wb");

    fwrite(n, sizeof(int), 1, pf); // écriture de l'entier n
    fwrite(roulements, sizeof(roulement), *n, pf); // écriture du contenu du tableau

    fclose(pf);
}

//Q13

#include <stdio.h>
#include <stdlib.h>

roulement *lireRoulements(char *fichier, int *n) //passage par adresse de n pour pouvoir récupérer la taille du tableau
{
    FILE *pf = fopen(fichier, "rb");
    roulement *roulements;

    fread(n, sizeof(int), 1, pf); // lecture du nombre n de roulements
    roulements = (roulement*) malloc(*n*sizeof(roulement)); // déclaration dynamique du tableau
    fread(roulements, sizeof(roulement), n, pf); // remplissage du tableau

    fclose(pf);

    return roulements;
}

//Q14

#include <stdio.h>
#include <stdlib.h>
#define N 20

int main()
{
    int *n, *i; //taille du tableau, indice du roulement RRG12 dans le tableau
    roulement *roulements = lireRoulements("roulements.bin", n);
    chercheRoulement("RRG12", roulements, i);
    roulements[*i].dint = 10.;
    ecrireTabRoulements("roulementbis.bin", roulements, n);

    return 0;
}