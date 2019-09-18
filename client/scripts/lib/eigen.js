    var D = [];           
    var E = [];          

    D[0] = 0.0;
    E[0] = 0.0;

    var N;

    var S = [];
    var C = [];
    var P = [];
    var Q = [];

    var SH, R1, R2;
    var M = 1;
    var DELTA = 1E-08;        
    var SHIFT = 0;
    var I, J;
    var K, Cond;
function getEigenValue(A0) {
    var tridiagmat = tridiagonal(A0);        
    N = A0.length;
    for (i = 1; i < tridiagmat.length; i++) {
        D[i] = tridiagmat[i][i];
    }

    for (i = 2; i < tridiagmat.length; i++) {
        E[i - 1] = tridiagmat[i][i - 1];
    }

    while (M <= N - 2) {
        K = 1;
        Cond = 0;
        while ((K < 50) && (Cond == 0)) {
            FindShift();
            if (Math.abs(E[M]) > DELTA) {
                SHIFT += SH;
                for (J = M; J <= N; J++) D[J] -= SH;
            } else {
                D[M] += SHIFT;
                M++;
                Cond = 1;
            }
            FormL();
            FormA();
            K++;
        }
    }

    FindShift();

    D[N - 1] = R1 + SHIFT;
    D[N] = R2 + SHIFT;
    for (J = 1; J <= N - 1; J++) E[J] = 0;
    console.log("--- Output : Eigen-Values of the tridiagonal matrix :\n");

    for (J = 1; J <= N; J++) {
        console.log("特征值为:", J, D[J]);
    }

    console.log("\n------------------------------------------------\n");

    //求实对称矩阵的QL分解，返回一个三对角矩阵
}

function tridiagonal(A0) {
    var K, I, J;
    var W = [];
    var V = [];
    var Q = [];
    var Sum, S, R, C;

    var N0 = A0.length;

    var A = [];
    for (i = 0; i <= N0; i++) {
        A[i] = [];
        for (j = 0; j <= N0; j++) A[i][j] = 0.0;
    }

    A[0][0] = 1.0;

    for (i = 0; i < N0; i++) {
        for (j = 0; j < N0; j++) {
            A[i + 1][j + 1] = A0[i][j];
        }
    }

    //方程的维数
    var N = A.length - 1;

    for (K = 1; K <= N - 2; K++) {
       
        var Sum = 0;
        for (J = K + 1; J <= N; J++) Sum += A[J][K] * A[J][K];
        S = Math.sqrt(Sum);

        if (A[K + 1][K] < 0) S = -S;
        var R = Math.sqrt(2.0 * A[K + 1][K] * S + 2.0 * S * S);        
        for (J = 1; J <= K; J++) W[J] = 0.0;
        W[K + 1] = (A[K + 1][K] + S) / R;
        for (J = K + 2; J <= N; J++) W[J] = A[J][K] / R;
        for (I = 1; I <= K; I++) V[I] = 0.0;
        for (I = K + 1; I <= N; I++) {
            var Sum = 0.0;
            for (J = K + 1; J <= N; J++) Sum += A[I][J] * W[J];
            V[I] = Sum;
        }

        C = 0;
        for (J = K + 1; J <= N; J++) C += W[J] * V[J];  
        for (J = 1; J <= K; J++) Q[J] = 0.0;
        for (J = K + 1; J <= N; J++) Q[J] = V[J] - C * W[J];  
        for (J = K + 2; J <= N; J++) A[J][K] = A[K][J] = 0.0;
        A[K + 1][K] = A[K][K + 1] = -S;
        for (J = K; J <= N; J++) A[J][J] -= 4.0 * Q[J] * W[J];
        for (I = K + 1; I <= N; I++) {
            for (J = I + 1; J <= N; J++) {
                A[I][J] = A[I][J] - 2.0 * W[I] * Q[J] - 2.0 * Q[I] * W[J];
                A[J][I] = A[I][J];
            }
        }
    }
    return A;
}           

function FindShift() {
    var B1, C1, D1;

    B1 = -(D[M + 1] + D[M]);
    C1 = D[M + 1] * D[M] - E[M] * E[M];
    D1 = Math.sqrt(Math.abs(B1 * B1 - 4.0 * C1));

    if (B1 > 0) {
        R1 = -0.5 * (B1 + D1);
        R2 = -2.0 * C1 / (B1 + D1);
    } else {
        R1 = ( - B1 + D1) / 2.0;
        R2 = 2.0 * C1 / ( - B1 + D1);
    }

    SH = R1;

    if (Math.abs(D[M] - R2) < Math.abs(D[M] - R1)) SH = R2;

    return;
}

function FormL() {

    var J;
    var PJ1, QJ;

    for (J = 1; J <= N; J++) P[J] = D[J];
    for (J = 1; J <= N - 1; J++) Q[J] = E[J];

    PJ1 = P[N];               
    QJ = Q[N - 1];

    for (J = N - 1; J >= M; J--) {
        P[J + 1] = Math.sqrt(PJ1 * PJ1 + Q[J] * Q[J]);
        C[J] = PJ1 / P[J + 1];
        S[J] = Q[J] / P[J + 1];
        Q[J] = C[J] * QJ + S[J] * D[J];
        PJ1 = C[J] * D[J] - S[J] * QJ;
        if (J > M) QJ = C[J] * Q[J - 1];                   
    }

    P[M] = PJ1;
    return;
}

function FormA() {

    var J;
    var I;               

    D[N] = S[N - 1] * Q[N - 1] + C[N - 1] * P[N];
    E[N - 1] = S[N - 1] * P[N - 1];

    for (J = N - 2; J >= M; J--) {
        D[J + 1] = S[J] * Q[J] + C[J] * C[J + 1] * P[J + 1];
        E[J] = S[J] * P[J];
    }

    D[M] = C[M] * P[M];

    return;
}

