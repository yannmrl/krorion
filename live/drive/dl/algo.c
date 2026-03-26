struct Ressort
{
    char ref[18];
    float L;
    float K;
    float dext;
};

typedef struct Ressort ressort;

#include <string.h>

ressort creerRessort(char *ref, float L, float K, float dext)
{
    ressort r;
    strcpy(r.ref, ref);
    r.L = L;
    r.K = K;
    r.dext = dext;

    return r;
}

void ajoutRessort(ressort r, ressort *tab, int length)
{
    tab[length] = r;
}

ressort chercheRessort(char *ref, ressort *tab, int length)
{
    for (int i = 0; i < length; i++)
    {
        if (strcmp(tab[i].ref, ref) == 0)
            return tab[i];
    }

    return (ressort) {"", 0, 0, 0};
}

void afficheRessort(ressort *tab, int i)
{
    printf("%s\t%f\t%f\t%f\n", tab[i].ref, tab[i].L, tab[i].K, tab[i].dext);
    if (i > 0) afficheRessort(tab, i-1);
}

struct LIFO
{
    ressort r;
    struct LIFO *next;
};

typedef struct LIFO LIFO;

#include <stdlib.h>

void ajoutRessortLIFO(LIFO **L, ressort r)
{
    LIFO *l = (LIFO*) malloc(sizeof(LIFO));
    l->r = r;
    l->next = *L;
    *L = l;
}

ressort chercheRessortLIFO(char *ref, LIFO *L)
{
    if (strcmp((L->r).ref, ref) == 0)
        return L->r;
    if (L->next != NULL) return chercheRessortLIFO(ref, L->next);
    else return (ressort) {"", 0, 0, 0};
}

void afficheRessortLIFO(LIFO *L)
{
    LIFO *l = (LIFO*) malloc(sizeof(LIFO));
    l = L;
    while (l != NULL)
    {
        printf("%s\t%f\t%f\t%f\n", (l->r).ref, (l->r).L, (l->r).K, (l->r).dext);
        l = l->next;
    }
    free(l);
}

#include <stdio.h>

void ecrireRessort(LIFO *L, char *fichier)
{
    FILE *pf = fopen(fichier, "wb");
    fwrite(L, sizeof(LIFO), 1, pf);
    fclose(pf);
}

LIFO *lireRessort(char *fichier)
{
    FILE *pf = fopen(fichier, "rb");
    LIFO *L = (LIFO*) malloc(sizeof(LIFO));
    fread(L, sizeof(LIFO), 1, pf);
    fclose(pf);
    return L;
}

int main()
{
    ressort r = creerRessort("ABCDE", 2.0, 1.5, 1.0);
    LIFO *L = NULL;
    ajoutRessortLIFO(&L, r);
    afficheRessortLIFO(L);
    ecrireRessort(L, "ressort.bin");
    free(L);

    LIFO *L2 = NULL;
    lireRessort(L2, "ressort.bin");
    afficheRessortLIFO(L2);
    free(L2);
    return 0;
}