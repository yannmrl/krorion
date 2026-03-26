#include <string.h>
#include <stdio.h>
#include <stdlib.h>

struct Ressort
{
    char ref[18];
    float L;
    float K;
    float dext;
};

typedef struct Ressort ressort;

ressort creerRessort(char *ref, float L, float K, float dext)
{
    ressort r;
    strcpy(r.ref, ref);
    r.L = L;
    r.K = K;
    r.dext = dext;

    return r;
}

void ajoutRessort(ressort r, ressort *tab, int n)
{
    tab[n] = r;
}

#define MAX 50

ressort chercheRessort(char *ref, ressort *tab)
{
    for (int i = 0; i < MAX; i++)
    {
        if (strcmp(tab[i].ref, ref) == 0)
            return tab[i];
    }

    return (ressort) {"", 0., 0., 0.};
}

void afficheRessort(ressort *tab, int n)
{
    printf("%s\t%f\t%f\t%f\n", tab[n].ref, tab[n].L, tab[n].K, tab[n].dext);
    if (n > 0) afficheRessort(tab, n-1);
}

struct LIFO
{
    ressort r;
    struct LIFO *next;
};

typedef struct LIFO LIFO;

void ajoutRessortLIFO(LIFO **L, ressort r)
{
    LIFO *l = (LIFO*) malloc(sizeof(LIFO));
    l->r = r;
    l->next = *L;
    *L = l;
}

ressort chercheRessortLIFO(LIFO *L, char *ref)
{
    if (strcmp((L->r).ref, ref) == 0) return L->r;
    if (L->next != NULL)
        return chercheRessortLIFO(L->next, ref);
    else return (ressort) {"", 0., 0., 0.};
}

void afficheRessortLIFO(LIFO *L)
{
    LIFO *l = (LIFO*) malloc(sizeof(LIFO));
    l = L;
    while (l != NULL)
    {
        printf("%s\t%f\t%f\t%f\n", l->r.ref, (l->r).L, (l->r).K, (l->r).dext);
        l = l->next;
    }
    free(l);
}

void ecrireRessorts(LIFO *L, char *fichier)
{
    FILE *pf = fopen(fichier, "wb");
    fwrite(L, sizeof(LIFO), 1, pf);
    fclose(pf);
}

LIFO *lireRessorts(char *fichier)
{
    FILE *pf = fopen(fichier, "rb");
    LIFO *L = (LIFO*) malloc(sizeof(LIFO));
    fread(L, sizeof(LIFO), 1, pf);
    fclose(pf);
    return L;
}

int main()
{
    ressort r = creerRessort("REF123", 1.2, 5., 2.);
    LIFO *L = NULL;
    ajoutRessortLIFO(&L, r);
    afficheRessortLIFO(L);
    ecrireRessorts(L, "lifo.bin");
    free(L);

    LIFO *LR = lireRessorts("lifo.bin");
    afficheRessortLIFO(LR);

    return 0;
}