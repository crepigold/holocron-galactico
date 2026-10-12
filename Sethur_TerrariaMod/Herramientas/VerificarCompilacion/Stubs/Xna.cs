// API "stub" de XNA/FNA: solo lo que usa el mod. Las firmas siguen a Microsoft.Xna.Framework.
using System;

namespace Microsoft.Xna.Framework
{
	public struct Vector2 : IEquatable<Vector2>
	{
		public float X, Y;
		public Vector2(float x, float y) { X = x; Y = y; }
		public Vector2(float v) { X = v; Y = v; }
		public static Vector2 Zero => new Vector2(0, 0);
		public static Vector2 One => new Vector2(1, 1);
		public static Vector2 UnitX => new Vector2(1, 0);
		public static Vector2 UnitY => new Vector2(0, 1);
		public float Length() => (float)Math.Sqrt(X * X + Y * Y);
		public float LengthSquared() => X * X + Y * Y;
		public void Normalize() { float l = Length(); if (l > 0) { X /= l; Y /= l; } }
		public static float Distance(Vector2 a, Vector2 b) => (a - b).Length();
		public static Vector2 Lerp(Vector2 a, Vector2 b, float t) => a + (b - a) * t;
		public static Vector2 operator +(Vector2 a, Vector2 b) => new Vector2(a.X + b.X, a.Y + b.Y);
		public static Vector2 operator -(Vector2 a, Vector2 b) => new Vector2(a.X - b.X, a.Y - b.Y);
		public static Vector2 operator -(Vector2 a) => new Vector2(-a.X, -a.Y);
		public static Vector2 operator *(Vector2 a, float s) => new Vector2(a.X * s, a.Y * s);
		public static Vector2 operator *(float s, Vector2 a) => new Vector2(a.X * s, a.Y * s);
		public static Vector2 operator *(Vector2 a, Vector2 b) => new Vector2(a.X * b.X, a.Y * b.Y);
		public static Vector2 operator /(Vector2 a, float s) => new Vector2(a.X / s, a.Y / s);
		public static bool operator ==(Vector2 a, Vector2 b) => a.X == b.X && a.Y == b.Y;
		public static bool operator !=(Vector2 a, Vector2 b) => !(a == b);
		public bool Equals(Vector2 o) => this == o;
		public override bool Equals(object o) => o is Vector2 v && this == v;
		public override int GetHashCode() => X.GetHashCode() ^ Y.GetHashCode();
	}

	public struct Vector3
	{
		public float X, Y, Z;
		public Vector3(float x, float y, float z) { X = x; Y = y; Z = z; }
	}

	public struct Point
	{
		public int X, Y;
		public Point(int x, int y) { X = x; Y = y; }
	}

	public struct Rectangle
	{
		public int X, Y, Width, Height;
		public Rectangle(int x, int y, int w, int h) { X = x; Y = y; Width = w; Height = h; }
		public int Left => X;
		public int Right => X + Width;
		public int Top => Y;
		public int Bottom => Y + Height;
		public bool Intersects(Rectangle o) => o.Left < Right && Left < o.Right && o.Top < Bottom && Top < o.Bottom;
	}

	public struct Color
	{
		public byte R, G, B, A;
		public Color(int r, int g, int b) { R = (byte)r; G = (byte)g; B = (byte)b; A = 255; }
		public Color(int r, int g, int b, int a) { R = (byte)r; G = (byte)g; B = (byte)b; A = (byte)a; }
		public static Color White => new Color(255, 255, 255);
		public static Color Yellow => new Color(255, 255, 0);
		public static Color Lerp(Color a, Color b, float t) => new Color((int)(a.R + (b.R - a.R) * t), (int)(a.G + (b.G - a.G) * t), (int)(a.B + (b.B - a.B) * t), (int)(a.A + (b.A - a.A) * t));
		public static Color operator *(Color c, float s) => new Color((int)(c.R * s), (int)(c.G * s), (int)(c.B * s), (int)(c.A * s));
		public Vector3 ToVector3() => new Vector3(R / 255f, G / 255f, B / 255f);
	}

	public static class MathHelper
	{
		public const float Pi = (float)Math.PI;
		public const float TwoPi = (float)(Math.PI * 2);
		public const float PiOver2 = (float)(Math.PI / 2);
		public static float Clamp(float v, float min, float max) => v < min ? min : (v > max ? max : v);
		public static int Clamp(int v, int min, int max) => v < min ? min : (v > max ? max : v);
		public static float Lerp(float a, float b, float t) => a + (b - a) * t;
		public static float SmoothStep(float a, float b, float t) { t = Clamp(t, 0, 1); t = t * t * (3 - 2 * t); return a + (b - a) * t; }
		public static float WrapAngle(float a) { while (a > Pi) a -= TwoPi; while (a <= -Pi) a += TwoPi; return a; }
	}
}

namespace Microsoft.Xna.Framework.Graphics
{
	public enum SpriteEffects { None = 0, FlipHorizontally = 1, FlipVertically = 2 }

	public class Texture2D
	{
		public int Width { get; }
		public int Height { get; }
	}

	public class SpriteBatch
	{
		public void Draw(Texture2D texture, Vector2 position, Color color) { }
		public void Draw(Texture2D texture, Vector2 position, Rectangle? sourceRectangle, Color color) { }
		public void Draw(Texture2D texture, Vector2 position, Rectangle? sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth) { }
		public void Draw(Texture2D texture, Vector2 position, Rectangle? sourceRectangle, Color color, float rotation, Vector2 origin, Vector2 scale, SpriteEffects effects, float layerDepth) { }
	}
}

namespace ReLogic.Content
{
	public enum AssetRequestMode { AsyncLoad, ImmediateLoad }

	public class Asset<T> where T : class
	{
		public T Value { get; }
		public bool IsLoaded { get; }
	}
}
